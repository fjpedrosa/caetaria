import { TrackingContext,TrackingService } from '../../application/ports/tracking-service';
import { addEventProperties, Event, eventToJSON,withSessionId, withUserId } from '../../domain/entities/event';

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

interface BrowserTrackingState {
  context: TrackingContext;
  currentSession?: StoredSession;
  eventQueue: Event[];
  trackingEnabled: boolean;
  consentLevel: 'none' | 'essential' | 'analytics' | 'all';
  flushTimer?: NodeJS.Timeout;
}

/**
 * Browser Tracking Service Factory
 * Functional implementation for browser-based analytics tracking
 */
export const createBrowserTrackingService = (configParams: Partial<TrackingConfig> = {}): TrackingService => {
  const config: TrackingConfig = {
    sessionTimeout: 30, // 30 minutes
    batchSize: 10,
    flushInterval: 5000, // 5 seconds
    enableLocalStorage: true,
    enableAutoTracking: true,
    ...configParams,
  };

  const state: BrowserTrackingState = {
    context: {},
    currentSession: undefined,
    eventQueue: [],
    trackingEnabled: true,
    consentLevel: 'analytics',
    flushTimer: undefined,
  };

  // Helper functions (previously private methods)
  const detectDeviceType = (userAgent: string): 'desktop' | 'mobile' | 'tablet' => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\\bMobile\\b)/i.test(userAgent);

    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  };

  const detectBrowser = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const detectOS = (userAgent: string): string => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  const detectBrowserContext = (): TrackingContext => {
    if (typeof window === 'undefined') return {};

    const userAgent = navigator.userAgent;
    const url = window.location.href;
    const referrer = document.referrer;

    return {
      userAgent,
      url,
      referrer: referrer || undefined,
      deviceType: detectDeviceType(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
    };
  };

  const generateSessionId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `sess_${timestamp}_${random}`;
  };

  const loadStoredSession = (): void => {
    if (!config.enableLocalStorage || typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('analytics_session');
      if (stored) {
        const session: StoredSession = JSON.parse(stored);
        session.startTime = new Date(session.startTime);
        session.lastActivity = new Date(session.lastActivity);

        // Check if session is still valid
        const now = new Date();
        const timeoutMs = config.sessionTimeout * 60 * 1000;
        if (now.getTime() - session.lastActivity.getTime() < timeoutMs) {
          state.currentSession = session;
        } else {
          localStorage.removeItem('analytics_session');
        }
      }
    } catch (error) {
      console.warn('Failed to load stored session:', error);
    }
  };

  const saveSessionToStorage = (): void => {
    if (!config.enableLocalStorage || !state.currentSession || typeof window === 'undefined') return;

    try {
      localStorage.setItem('analytics_session', JSON.stringify(state.currentSession));
    } catch (error) {
      console.warn('Failed to save session to storage:', error);
    }
  };

  const loadTrackingPreferences = (): void => {
    if (!config.enableLocalStorage || typeof window === 'undefined') return;

    try {
      const enabled = localStorage.getItem('analytics_tracking_enabled');
      if (enabled !== null) {
        state.trackingEnabled = enabled === 'true';
      }

      const consent = localStorage.getItem('analytics_consent_level');
      if (consent) {
        state.consentLevel = consent as typeof state.consentLevel;
      }
    } catch (error) {
      console.warn('Failed to load tracking preferences:', error);
    }
  };

  const saveTrackingPreferences = (): void => {
    if (!config.enableLocalStorage || typeof window === 'undefined') return;

    try {
      localStorage.setItem('analytics_tracking_enabled', state.trackingEnabled.toString());
      localStorage.setItem('analytics_consent_level', state.consentLevel);
    } catch (error) {
      console.warn('Failed to save tracking preferences:', error);
    }
  };

  const updateSessionActivity = (): void => {
    if (state.currentSession) {
      state.currentSession.lastActivity = new Date();
      saveSessionToStorage();
    }
  };

  const setupAutoTracking = (): void => {
    if (typeof window === 'undefined') return;

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        flush(); // Ensure events are sent before page becomes hidden
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      flush();
    });

    // Update session activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateSessionActivity, { passive: true });
    });
  };

  const startFlushTimer = (): void => {
    if (state.flushTimer) {
      clearInterval(state.flushTimer);
    }

    state.flushTimer = setInterval(() => {
      flush();
    }, config.flushInterval);
  };

  const initializeTracking = (): void => {
    // Detect browser context
    if (typeof window !== 'undefined') {
      state.context = detectBrowserContext();

      if (config.enableLocalStorage) {
        loadStoredSession();
        loadTrackingPreferences();
      }

      if (config.enableAutoTracking) {
        setupAutoTracking();
      }

      // Start periodic flush
      startFlushTimer();
    }
  };

  // Public API implementation
  const trackEvent = async (event: Event): Promise<void> => {
    if (!state.trackingEnabled) {
      return;
    }

    state.eventQueue.push(event);

    // Auto-flush if queue is full
    if (state.eventQueue.length >= config.batchSize) {
      await flush();
    }
  };

  const trackEvents = async (events: Event[]): Promise<void> => {
    if (!state.trackingEnabled) {
      return;
    }

    state.eventQueue.push(...events);

    // Auto-flush if queue is full
    if (state.eventQueue.length >= config.batchSize) {
      await flush();
    }
  };

  const setContext = (context: TrackingContext): void => {
    state.context = { ...state.context, ...context };
  };

  const getContext = (): TrackingContext => {
    return { ...state.context };
  };

  const enrichEvent = (event: Event): Event => {
    // Add current context to event metadata
    let enrichedEvent = withUserId(event, event.userId || state.context.userId || '');
    enrichedEvent = withSessionId(enrichedEvent, event.sessionId || getCurrentSession() || '');

    // Add context properties
    const contextProperties = {
      url: state.context.url,
      referrer: state.context.referrer,
      device_type: state.context.deviceType,
      browser: state.context.browser,
      os: state.context.os,
    };

    return addEventProperties(enrichedEvent, contextProperties);
  };

  const startSession = (): string => {
    const sessionId = generateSessionId();
    const now = new Date();

    state.currentSession = {
      id: sessionId,
      startTime: now,
      lastActivity: now,
      userId: state.context.userId,
    };

    saveSessionToStorage();
    return sessionId;
  };

  const endSession = (sessionId: string): void => {
    if (state.currentSession?.id === sessionId) {
      state.currentSession = undefined;
      if (config.enableLocalStorage && typeof window !== 'undefined') {
        localStorage.removeItem('analytics_session');
      }
    }
  };

  const getCurrentSession = (): string | undefined => {
    if (!state.currentSession) {
      // Auto-start session if none exists
      return startSession();
    }

    // Check if session is still valid
    const now = new Date();
    const timeoutMs = config.sessionTimeout * 60 * 1000;
    if (now.getTime() - state.currentSession.lastActivity.getTime() >= timeoutMs) {
      // Session expired, start new one
      return startSession();
    }

    return state.currentSession.id;
  };

  const setTrackingEnabled = (enabled: boolean): void => {
    state.trackingEnabled = enabled;
    saveTrackingPreferences();

    if (!enabled) {
      // Clear queue when tracking is disabled
      state.eventQueue = [];
    }
  };

  const isTrackingEnabled = (): boolean => {
    return state.trackingEnabled;
  };

  const setConsentLevel = (level: 'none' | 'essential' | 'analytics' | 'all'): void => {
    state.consentLevel = level;
    saveTrackingPreferences();

    if (level === 'none') {
      setTrackingEnabled(false);
    }
  };

  const getConsentLevel = (): 'none' | 'essential' | 'analytics' | 'all' => {
    return state.consentLevel;
  };

  const flush = async (): Promise<void> => {
    if (state.eventQueue.length === 0) {
      return;
    }

    const eventsToSend = [...state.eventQueue];
    state.eventQueue = [];

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
            events: eventsToSend.map(event => eventToJSON(event)),
          }),
        });
      }
    } catch (error) {
      console.warn('Failed to flush analytics events:', error);
      // Re-queue events on failure (with some limit to prevent memory issues)
      if (state.eventQueue.length < 100) {
        state.eventQueue.unshift(...eventsToSend);
      }
    }
  };

  const clear = async (): Promise<void> => {
    state.eventQueue = [];
    state.currentSession = undefined;

    if (config.enableLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem('analytics_session');
      localStorage.removeItem('analytics_tracking_enabled');
      localStorage.removeItem('analytics_consent_level');
    }
  };

  const destroy = (): void => {
    if (state.flushTimer) {
      clearInterval(state.flushTimer);
    }

    // Flush remaining events
    flush();
  };

  // Initialize tracking on creation
  initializeTracking();

  // Return service interface
  return {
    trackEvent,
    trackEvents,
    setContext,
    getContext,
    enrichEvent,
    startSession,
    endSession,
    getCurrentSession,
    setTrackingEnabled,
    isTrackingEnabled,
    setConsentLevel,
    getConsentLevel,
    flush,
    clear,
    destroy,
  };
};

/**
 * Create default browser tracking service instance
 */
export const createDefaultBrowserTrackingService = (): TrackingService => {
  return createBrowserTrackingService();
};