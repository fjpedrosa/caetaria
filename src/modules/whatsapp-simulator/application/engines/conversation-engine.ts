/**
 * ConversationEngine - Core engine for orchestrating WhatsApp conversation playback
 */

import { 
  BehaviorSubject, 
  Observable, 
  Subject, 
  combineLatest, 
  merge, 
  timer, 
  of, 
  EMPTY,
  interval
} from 'rxjs';
import { 
  map, 
  filter, 
  switchMap, 
  takeUntil, 
  tap, 
  delay, 
  share, 
  distinctUntilChanged,
  scan,
  startWith,
  catchError,
  retry,
  debounceTime,
  throttleTime
} from 'rxjs/operators';

import { 
  Conversation, 
  Message, 
  ConversationStatus 
} from '../../domain/entities';
import { 
  ConversationEvent,
  ConversationEventFactory,
  MessageTypingStartedEvent,
  MessageSentEvent,
  ConversationProgressEvent
} from '../../domain/events';

export interface EngineConfig {
  maxRetries: number;
  debounceTime: number;
  throttleTime: number;
  enableDebug: boolean;
  enablePerformanceTracking: boolean;
}

export interface PlaybackState {
  conversation: Conversation | null;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  hasError: boolean;
  currentMessageIndex: number;
  currentMessage: Message | null;
  nextMessage: Message | null;
  playbackSpeed: number;
  progress: {
    completionPercentage: number;
    elapsedTime: number;
    remainingTime: number;
  };
  typingStates: Map<string, boolean>;
  error?: Error;
}

export class ConversationEngine {
  private readonly config: EngineConfig;
  
  // Core state subjects
  private readonly conversationSubject = new BehaviorSubject<Conversation | null>(null);
  private readonly playbackStateSubject = new BehaviorSubject<PlaybackState>(this.createInitialState());
  private readonly eventSubject = new Subject<ConversationEvent>();
  
  // Control subjects
  private readonly playSubject = new Subject<void>();
  private readonly pauseSubject = new Subject<void>();
  private readonly resetSubject = new Subject<void>();
  private readonly stopSubject = new Subject<void>();
  private readonly jumpToSubject = new Subject<number>();
  private readonly speedChangeSubject = new Subject<number>();
  
  // Internal timing subjects
  private readonly messageTimerSubject = new Subject<Message>();
  private readonly typingSubject = new Subject<{ message: Message; isTyping: boolean }>();
  
  // Public observables
  public readonly conversation$ = this.conversationSubject.asObservable();
  public readonly playbackState$ = this.playbackStateSubject.asObservable();
  public readonly events$ = this.eventSubject.asObservable();
  
  // Specialized observables
  public readonly messages$ = this.conversation$.pipe(
    map(conv => conv?.messages || []),
    distinctUntilChanged()
  );
  
  public readonly currentMessage$ = this.playbackState$.pipe(
    map(state => state.currentMessage),
    distinctUntilChanged()
  );
  
  public readonly progress$ = this.playbackState$.pipe(
    map(state => state.progress),
    distinctUntilChanged((prev, curr) => 
      prev.completionPercentage === curr.completionPercentage
    )
  );
  
  public readonly isPlaying$ = this.playbackState$.pipe(
    map(state => state.isPlaying),
    distinctUntilChanged()
  );
  
  public readonly typingStates$ = this.playbackState$.pipe(
    map(state => state.typingStates),
    distinctUntilChanged()
  );

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = {
      maxRetries: 3,
      debounceTime: 100,
      throttleTime: 16, // ~60fps
      enableDebug: false,
      enablePerformanceTracking: false,
      ...config
    };

    this.initializeMessagePlayback();
    this.initializeTypingIndicators();
    this.initializeProgressTracking();
    this.initializeErrorHandling();
    
    if (this.config.enableDebug) {
      this.initializeDebugMode();
    }
  }

  /**
   * Load a conversation into the engine
   */
  loadConversation(conversation: Conversation): void {
    this.conversationSubject.next(conversation);
    this.updatePlaybackState(state => ({
      ...state,
      conversation,
      currentMessageIndex: conversation.currentIndex,
      currentMessage: conversation.currentMessage,
      nextMessage: conversation.nextMessage,
      playbackSpeed: conversation.settings.playbackSpeed
    }));
    
    this.emitEvent(ConversationEventFactory.createDebug(
      conversation.metadata.id,
      'info',
      'Conversation loaded',
      { messageCount: conversation.messages.length }
    ));
  }

  /**
   * Start conversation playback
   */
  play(): Observable<ConversationEvent> {
    this.playSubject.next();
    return this.events$.pipe(
      filter(event => event.type.startsWith('conversation.') || event.type.startsWith('message.'))
    );
  }

  /**
   * Pause conversation playback
   */
  pause(): void {
    this.pauseSubject.next();
  }

  /**
   * Reset conversation to beginning
   */
  reset(): void {
    this.resetSubject.next();
  }

  /**
   * Jump to specific message index
   */
  jumpTo(messageIndex: number): void {
    this.jumpToSubject.next(messageIndex);
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    if (speed < 0.1 || speed > 5.0) {
      throw new Error('Playback speed must be between 0.1x and 5.0x');
    }
    this.speedChangeSubject.next(speed);
  }

  /**
   * Stop the engine and clean up resources
   */
  stop(): void {
    this.stopSubject.next();
  }

  /**
   * Get current playback state synchronously
   */
  getCurrentState(): PlaybackState {
    return this.playbackStateSubject.value;
  }

  /**
   * Get current conversation synchronously
   */
  getCurrentConversation(): Conversation | null {
    return this.conversationSubject.value;
  }

  /**
   * Initialize message playback orchestration
   */
  private initializeMessagePlayback(): void {
    // Main playback control flow
    const playbackControl$ = merge(
      this.playSubject.pipe(map(() => ({ action: 'play' as const }))),
      this.pauseSubject.pipe(map(() => ({ action: 'pause' as const }))),
      this.resetSubject.pipe(map(() => ({ action: 'reset' as const }))),
      this.jumpToSubject.pipe(map(index => ({ action: 'jump' as const, index })))
    ).pipe(
      debounceTime(this.config.debounceTime),
      share()
    );

    // Handle play action
    playbackControl$.pipe(
      filter(control => control.action === 'play'),
      switchMap(() => {
        const conversation = this.getCurrentConversation();
        if (!conversation) return EMPTY;

        conversation.play();
        this.updatePlaybackState(state => ({
          ...state,
          isPlaying: true,
          isPaused: false,
          hasError: false
        }));

        this.emitEvent(ConversationEventFactory.createConversationStarted(
          conversation.metadata.id,
          conversation
        ));

        return this.createMessagePlaybackStream(conversation);
      }),
      takeUntil(this.stopSubject)
    ).subscribe({
      next: (event) => this.emitEvent(event),
      error: (error) => this.handleError(error)
    });

    // Handle pause action
    playbackControl$.pipe(
      filter(control => control.action === 'pause'),
      takeUntil(this.stopSubject)
    ).subscribe(() => {
      const conversation = this.getCurrentConversation();
      if (!conversation) return;

      conversation.pause();
      this.updatePlaybackState(state => ({
        ...state,
        isPlaying: false,
        isPaused: true
      }));

      this.emitEvent(ConversationEventFactory.createConversationPaused(
        conversation.metadata.id,
        conversation.currentIndex,
        conversation.getProgress()
      ));
    });

    // Handle reset action
    playbackControl$.pipe(
      filter(control => control.action === 'reset'),
      takeUntil(this.stopSubject)
    ).subscribe(() => {
      const conversation = this.getCurrentConversation();
      if (!conversation) return;

      conversation.reset();
      this.updatePlaybackState(state => ({
        ...this.createInitialState(),
        conversation
      }));

      this.emitEvent(ConversationEventFactory.createDebug(
        conversation.metadata.id,
        'info',
        'Conversation reset'
      ));
    });

    // Handle jump action
    playbackControl$.pipe(
      filter(control => control.action === 'jump'),
      takeUntil(this.stopSubject)
    ).subscribe((control) => {
      const conversation = this.getCurrentConversation();
      if (!conversation || control.action !== 'jump') return;

      const previousIndex = conversation.currentIndex;
      conversation.jumpTo(control.index!);
      
      this.updatePlaybackState(state => ({
        ...state,
        currentMessageIndex: control.index!,
        currentMessage: conversation.currentMessage,
        nextMessage: conversation.nextMessage
      }));

      if (conversation.currentMessage) {
        this.emitEvent(ConversationEventFactory.createDebug(
          conversation.metadata.id,
          'info',
          `Jumped from message ${previousIndex} to ${control.index}`,
          { message: conversation.currentMessage }
        ));
      }
    });
  }

  /**
   * Create reactive stream for message playback
   */
  private createMessagePlaybackStream(conversation: Conversation): Observable<ConversationEvent> {
    return new Observable<ConversationEvent>(subscriber => {
      const processNextMessage = () => {
        const currentMessage = conversation.currentMessage;
        if (!currentMessage) {
          // Conversation completed
          this.updatePlaybackState(state => ({
            ...state,
            isPlaying: false,
            isCompleted: true
          }));
          
          subscriber.next(ConversationEventFactory.createDebug(
            conversation.metadata.id,
            'info',
            'Conversation completed'
          ));
          subscriber.complete();
          return;
        }

        // Calculate timing based on playback speed
        const speed = conversation.settings.playbackSpeed;
        const delayBeforeTyping = currentMessage.timing.delayBeforeTyping / speed;
        const typingDuration = currentMessage.timing.typingDuration / speed;

        // Emit message queued event
        subscriber.next(ConversationEventFactory.createDebug(
          conversation.metadata.id,
          'debug',
          `Processing message ${conversation.currentIndex}`,
          { message: currentMessage }
        ));

        // Start typing after delay
        timer(delayBeforeTyping).subscribe(() => {
          if (conversation.isPlaying) {
            subscriber.next(ConversationEventFactory.createMessageTypingStarted(
              conversation.metadata.id,
              currentMessage,
              conversation.currentIndex,
              typingDuration
            ));

            // Send message after typing duration
            timer(typingDuration).subscribe(() => {
              if (conversation.isPlaying) {
                currentMessage.updateStatus('sent');
                
                subscriber.next(ConversationEventFactory.createMessageSent(
                  conversation.metadata.id,
                  currentMessage,
                  conversation.currentIndex
                ));

                // Move to next message
                const hasNext = conversation.advanceToNext();
                this.updatePlaybackState(state => ({
                  ...state,
                  currentMessageIndex: conversation.currentIndex,
                  currentMessage: conversation.currentMessage,
                  nextMessage: conversation.nextMessage,
                  progress: {
                    ...conversation.getProgress(),
                    completionPercentage: (conversation.currentIndex / conversation.messages.length) * 100
                  }
                }));

                if (hasNext && conversation.isPlaying) {
                  // Continue with next message
                  setTimeout(processNextMessage, 0);
                } else {
                  // Conversation completed
                  this.updatePlaybackState(state => ({
                    ...state,
                    isPlaying: false,
                    isCompleted: true
                  }));
                  subscriber.complete();
                }
              }
            });
          }
        });
      };

      // Start processing
      processNextMessage();

      // Cleanup function
      return () => {
        // Any cleanup logic here
      };
    }).pipe(
      takeUntil(merge(this.pauseSubject, this.resetSubject, this.stopSubject)),
      catchError(error => {
        this.handleError(error);
        return EMPTY;
      })
    );
  }

  /**
   * Initialize typing indicator management
   */
  private initializeTypingIndicators(): void {
    this.events$.pipe(
      filter(event => event.type === 'message.typing_started' || event.type === 'message.typing_stopped'),
      takeUntil(this.stopSubject)
    ).subscribe(event => {
      if (event.type === 'message.typing_started') {
        const typingEvent = event as MessageTypingStartedEvent;
        this.updatePlaybackState(state => {
          const newTypingStates = new Map(state.typingStates);
          newTypingStates.set(typingEvent.payload.message.sender, true);
          return {
            ...state,
            typingStates: newTypingStates
          };
        });

        // Auto-stop typing after duration
        timer(typingEvent.payload.typingDuration).subscribe(() => {
          this.updatePlaybackState(state => {
            const newTypingStates = new Map(state.typingStates);
            newTypingStates.set(typingEvent.payload.message.sender, false);
            return {
              ...state,
              typingStates: newTypingStates
            };
          });
        });
      }
    });
  }

  /**
   * Initialize progress tracking
   */
  private initializeProgressTracking(): void {
    // Emit progress events periodically during playback
    this.isPlaying$.pipe(
      switchMap(isPlaying => isPlaying ? interval(1000) : EMPTY),
      takeUntil(this.stopSubject)
    ).subscribe(() => {
      const conversation = this.getCurrentConversation();
      if (conversation) {
        const progress = conversation.getProgress();
        this.emitEvent({
          id: `progress-${Date.now()}`,
          type: 'conversation.progress',
          timestamp: new Date(),
          conversationId: conversation.metadata.id,
          payload: {
            progress,
            currentMessage: conversation.currentMessage
          }
        } as ConversationProgressEvent);
      }
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.events$.pipe(
      filter(event => event.type === 'conversation.error'),
      takeUntil(this.stopSubject)
    ).subscribe(event => {
      this.updatePlaybackState(state => ({
        ...state,
        hasError: true,
        isPlaying: false,
        error: (event.payload as any).error
      }));
    });
  }

  /**
   * Initialize debug mode
   */
  private initializeDebugMode(): void {
    this.events$.pipe(
      throttleTime(this.config.throttleTime),
      takeUntil(this.stopSubject)
    ).subscribe(event => {
      if (this.config.enableDebug) {
        console.log('[ConversationEngine]', event.type, event);
      }
    });
  }

  /**
   * Handle errors with retry logic
   */
  private handleError(error: Error): void {
    const conversation = this.getCurrentConversation();
    if (conversation) {
      this.emitEvent(ConversationEventFactory.createError(
        conversation.metadata.id,
        error,
        conversation.currentIndex,
        true
      ));
    }

    console.error('ConversationEngine error:', error);
  }

  /**
   * Update playback state
   */
  private updatePlaybackState(updater: (state: PlaybackState) => PlaybackState): void {
    const currentState = this.playbackStateSubject.value;
    const newState = updater(currentState);
    this.playbackStateSubject.next(newState);
  }

  /**
   * Emit event to event stream
   */
  private emitEvent(event: ConversationEvent): void {
    this.eventSubject.next(event);
  }

  /**
   * Create initial playback state
   */
  private createInitialState(): PlaybackState {
    return {
      conversation: null,
      isPlaying: false,
      isPaused: false,
      isCompleted: false,
      hasError: false,
      currentMessageIndex: 0,
      currentMessage: null,
      nextMessage: null,
      playbackSpeed: 1.0,
      progress: {
        completionPercentage: 0,
        elapsedTime: 0,
        remainingTime: 0
      },
      typingStates: new Map()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopSubject.next();
    this.stopSubject.complete();
    this.conversationSubject.complete();
    this.playbackStateSubject.complete();
    this.eventSubject.complete();
  }
}