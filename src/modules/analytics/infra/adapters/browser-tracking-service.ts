import { TrackingContext,TrackingService } from '../../application/ports/tracking-service';
import { EventEntity } from '../../domain/entities/event';

interface StoredSession {
  id: string;
  startTime: Date;
  lastActivity: Date;
  userId?: string;
}

interface TrackingConfig {
  sessionTimeout: number; // minutes
  batchSize: number;
  flushInterval: number; // milliseconds
  enableLocalStorage: boolean;
  enableAutoTracking: boolean;
}

export class BrowserTrackingService implements TrackingService {
  private context: TrackingContext = {};
  private currentSession?: StoredSession;
  private eventQueue: EventEntity[] = [];
  private trackingEnabled = true;
  private consentLevel: 'none' | 'essential' | 'analytics' | 'all' = 'analytics';
  private config: TrackingConfig;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = {
      sessionTimeout: 30, // 30 minutes
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
      enableLocalStorage: true,
      enableAutoTracking: true,
      ...config,
    };

    this.initializeTracking();
  }

  private initializeTracking(): void {
    // Detect browser context
    if (typeof window !== 'undefined') {
      this.context = this.detectBrowserContext();
      
      if (this.config.enableLocalStorage) {
        this.loadStoredSession();
        this.loadTrackingPreferences();
      }

      if (this.config.enableAutoTracking) {
        this.setupAutoTracking();
      }

      // Start periodic flush
      this.startFlushTimer();
    }
  }

  private detectBrowserContext(): TrackingContext {
    const userAgent = navigator.userAgent;
    const url = window.location.href;
    const referrer = document.referrer;

    return {
      userAgent,
      url,
      referrer: referrer || undefined,
      deviceType: this.detectDeviceType(userAgent),
      browser: this.detectBrowser(userAgent),
      os: this.detectOS(userAgent),
    };
  }

  private detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\\bMobile\\b)/i.test(userAgent);
    
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  }

  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private setupAutoTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush(); // Ensure events are sent before page becomes hidden
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Update session activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, this.updateSessionActivity.bind(this), { passive: true });
    });
  }

  private updateSessionActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date();
      this.saveSessionToStorage();
    }
  }

  private loadStoredSession(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const stored = localStorage.getItem('analytics_session');
      if (stored) {
        const session: StoredSession = JSON.parse(stored);
        session.startTime = new Date(session.startTime);
        session.lastActivity = new Date(session.lastActivity);

        // Check if session is still valid
        const now = new Date();
        const timeoutMs = this.config.sessionTimeout * 60 * 1000;
        if (now.getTime() - session.lastActivity.getTime() < timeoutMs) {
          this.currentSession = session;
        } else {
          localStorage.removeItem('analytics_session');
        }
      }
    } catch (error) {
      console.warn('Failed to load stored session:', error);
    }
  }

  private saveSessionToStorage(): void {
    if (!this.config.enableLocalStorage || !this.currentSession) return;

    try {
      localStorage.setItem('analytics_session', JSON.stringify(this.currentSession));
    } catch (error) {
      console.warn('Failed to save session to storage:', error);
    }
  }

  private loadTrackingPreferences(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const enabled = localStorage.getItem('analytics_tracking_enabled');
      if (enabled !== null) {
        this.trackingEnabled = enabled === 'true';
      }

      const consent = localStorage.getItem('analytics_consent_level');
      if (consent) {
        this.consentLevel = consent as typeof this.consentLevel;
      }
    } catch (error) {
      console.warn('Failed to load tracking preferences:', error);
    }
  }

  private saveTrackingPreferences(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      localStorage.setItem('analytics_tracking_enabled', this.trackingEnabled.toString());
      localStorage.setItem('analytics_consent_level', this.consentLevel);
    } catch (error) {
      console.warn('Failed to save tracking preferences:', error);
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // TrackingService implementation
  async trackEvent(event: EventEntity): Promise<void> {
    if (!this.trackingEnabled) {
      return;
    }

    this.eventQueue.push(event);

    // Auto-flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  async trackEvents(events: EventEntity[]): Promise<void> {
    if (!this.trackingEnabled) {
      return;
    }

    this.eventQueue.push(...events);

    // Auto-flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  setContext(context: TrackingContext): void {
    this.context = { ...this.context, ...context };
  }

  getContext(): TrackingContext {
    return { ...this.context };
  }

  enrichEvent(event: EventEntity): EventEntity {
    // Add current context to event metadata
    const enrichedEvent = event
      .withUserId(event.userId || this.context.userId)
      .withSessionId(event.sessionId || this.getCurrentSession());

    // Add context properties
    const contextProperties = {
      url: this.context.url,
      referrer: this.context.referrer,
      device_type: this.context.deviceType,
      browser: this.context.browser,
      os: this.context.os,
    };

    return enrichedEvent.addProperties(contextProperties);
  }

  startSession(): string {
    const sessionId = this.generateSessionId();
    const now = new Date();

    this.currentSession = {
      id: sessionId,
      startTime: now,
      lastActivity: now,
      userId: this.context.userId,
    };

    this.saveSessionToStorage();
    return sessionId;
  }

  endSession(sessionId: string): void {
    if (this.currentSession?.id === sessionId) {
      this.currentSession = undefined;
      if (this.config.enableLocalStorage) {
        localStorage.removeItem('analytics_session');
      }
    }
  }

  getCurrentSession(): string | undefined {
    if (!this.currentSession) {
      // Auto-start session if none exists
      return this.startSession();
    }

    // Check if session is still valid
    const now = new Date();
    const timeoutMs = this.config.sessionTimeout * 60 * 1000;
    if (now.getTime() - this.currentSession.lastActivity.getTime() >= timeoutMs) {
      // Session expired, start new one
      return this.startSession();
    }

    return this.currentSession.id;
  }

  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;
    this.saveTrackingPreferences();

    if (!enabled) {
      // Clear queue when tracking is disabled
      this.eventQueue = [];
    }
  }

  isTrackingEnabled(): boolean {
    return this.trackingEnabled;
  }

  setConsentLevel(level: 'none' | 'essential' | 'analytics' | 'all'): void {
    this.consentLevel = level;
    this.saveTrackingPreferences();

    if (level === 'none') {
      this.setTrackingEnabled(false);
    }
  }

  getConsentLevel(): 'none' | 'essential' | 'analytics' | 'all' {
    return this.consentLevel;
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, this would send events to your analytics API
      // For now, we just log them (you'd integrate with your actual API)
      if (typeof window !== 'undefined' && 'fetch' in window) {
        await fetch('/api/analytics/events/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: eventsToSend.map(event => event.toJSON()),
          }),
        });
      }
    } catch (error) {
      console.warn('Failed to flush analytics events:', error);
      // Re-queue events on failure (with some limit to prevent memory issues)
      if (this.eventQueue.length < 100) {
        this.eventQueue.unshift(...eventsToSend);
      }
    }
  }

  async clear(): Promise<void> {
    this.eventQueue = [];
    this.currentSession = undefined;
    
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('analytics_session');
      localStorage.removeItem('analytics_tracking_enabled');
      localStorage.removeItem('analytics_consent_level');
    }
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `sess_${timestamp}_${random}`;
  }

  // Cleanup method
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush remaining events
    this.flush();
  }
}