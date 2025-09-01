// =============================================================================
// Functional EventType Implementation - Clean Architecture
// =============================================================================

/**
 * Event type enum with all possible event categories
 */
export enum EventTypeEnum {
  // A/B Testing events
  AB_TEST_VARIANT_VIEWED = 'ab_test_variant_viewed',
  AB_TEST_CONVERSION = 'ab_test_conversion',
  AB_TEST_INTERACTION = 'ab_test_interaction',

  // Performance events
  CORE_WEB_VITAL = 'core_web_vital',
  MEMORY_CONSUMPTION = 'memory_consumption',
  PAGE_PERFORMANCE = 'page_performance',

  // Funnel tracking events
  FUNNEL_ENTRY = 'funnel_entry',
  FUNNEL_PROGRESSION = 'funnel_progression',
  FUNNEL_EXIT = 'funnel_exit',

  // Retention events
  USER_RETENTION_PING = 'user_retention_ping',
  FEATURE_ENGAGEMENT = 'feature_engagement',
  // Page and navigation events
  PAGE_VIEW = 'page_view',
  PAGE_LOAD = 'page_load',
  ROUTE_CHANGE = 'route_change',

  // User interaction events
  CLICK = 'click',
  FORM_SUBMIT = 'form_submit',
  FORM_FIELD_FOCUS = 'form_field_focus',
  SCROLL = 'scroll',
  SEARCH = 'search',
  DOWNLOAD = 'download',

  // Business conversion events
  LEAD_GENERATED = 'lead_generated',
  SIGNUP_STARTED = 'signup_started',
  SIGNUP_COMPLETED = 'signup_completed',
  TRIAL_STARTED = 'trial_started',
  PURCHASE = 'purchase',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',

  // Product-specific events
  BOT_CREATED = 'bot_created',
  BOT_CONFIGURED = 'bot_configured',
  BOT_ACTIVATED = 'bot_activated',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  WEBHOOK_CONFIGURED = 'webhook_configured',
  INTEGRATION_CONNECTED = 'integration_connected',

  // Performance and technical events
  PERFORMANCE_METRIC = 'performance_metric',
  ERROR_OCCURRED = 'error_occurred',
  API_REQUEST = 'api_request',
  API_ERROR = 'api_error',

  // Marketing and campaign events
  CAMPAIGN_VIEW = 'campaign_view',
  AD_CLICK = 'ad_click',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',

  // System and admin events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  ADMIN_ACTION = 'admin_action',
  SYSTEM_EVENT = 'system_event',

  // Custom events
  CUSTOM = 'custom',
}

/**
 * Union type for all valid event type values
 */
export type EventTypeValue = EventTypeEnum | `custom_${string}`;

/**
 * Event category types
 */
export type EventCategory = 'page' | 'user_action' | 'conversion' | 'system' | 'custom' | 'other';

/**
 * Immutable event type interface
 */
export interface EventTypeInterface {
  readonly value: EventTypeValue;
}

// Remove the type alias to avoid conflicts - we'll keep only the interface and class

// =============================================================================
// Event Type Categories (Immutable Arrays)
// =============================================================================

export const PAGE_VIEW_EVENTS: readonly EventTypeEnum[] = [
  EventTypeEnum.PAGE_VIEW,
  EventTypeEnum.PAGE_LOAD,
  EventTypeEnum.ROUTE_CHANGE,
] as const;

export const USER_ACTION_EVENTS: readonly EventTypeEnum[] = [
  EventTypeEnum.CLICK,
  EventTypeEnum.FORM_SUBMIT,
  EventTypeEnum.FORM_FIELD_FOCUS,
  EventTypeEnum.SCROLL,
  EventTypeEnum.SEARCH,
  EventTypeEnum.DOWNLOAD,
] as const;

export const CONVERSION_EVENTS: readonly EventTypeEnum[] = [
  EventTypeEnum.LEAD_GENERATED,
  EventTypeEnum.SIGNUP_STARTED,
  EventTypeEnum.SIGNUP_COMPLETED,
  EventTypeEnum.TRIAL_STARTED,
  EventTypeEnum.PURCHASE,
  EventTypeEnum.SUBSCRIPTION_CREATED,
] as const;

export const SYSTEM_EVENTS: readonly EventTypeEnum[] = [
  EventTypeEnum.PERFORMANCE_METRIC,
  EventTypeEnum.ERROR_OCCURRED,
  EventTypeEnum.API_REQUEST,
  EventTypeEnum.API_ERROR,
  EventTypeEnum.SYSTEM_EVENT,
] as const;

// =============================================================================
// Pure Functions for Event Type Operations
// =============================================================================

/**
 * Validates if a value is a valid event type
 * Pure function - no side effects
 */
export const isValidEventType = (value: string): value is EventTypeValue => {
  return Object.values(EventTypeEnum).includes(value as EventTypeEnum) ||
         value.startsWith('custom_');
};

/**
 * Creates an EventType from a string value with validation
 * Pure function with immutable result
 */
export const createEventType = (value: string): EventTypeInterface => {
  if (!isValidEventType(value)) {
    throw new Error(`Invalid event type: ${value}`);
  }
  return { value } as const;
};

/**
 * Creates a custom event type from a name
 * Pure function - sanitizes input and creates valid custom event type
 */
export const createCustomEventType = (name: string): EventTypeInterface => {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return createEventType(`custom_${sanitizedName}`);
};

/**
 * Checks if an event type is a page view event
 * Pure function - no side effects
 */
export const isPageViewEvent = (eventType: EventTypeInterface): boolean => {
  return PAGE_VIEW_EVENTS.includes(eventType.value as EventTypeEnum);
};

/**
 * Checks if an event type is a user action event
 * Pure function - no side effects
 */
export const isUserActionEvent = (eventType: EventTypeInterface): boolean => {
  return USER_ACTION_EVENTS.includes(eventType.value as EventTypeEnum);
};

/**
 * Checks if an event type is a conversion event
 * Pure function - no side effects
 */
export const isConversionEvent = (eventType: EventTypeInterface): boolean => {
  return CONVERSION_EVENTS.includes(eventType.value as EventTypeEnum);
};

/**
 * Checks if an event type is a system event
 * Pure function - no side effects
 */
export const isSystemEvent = (eventType: EventTypeInterface): boolean => {
  return SYSTEM_EVENTS.includes(eventType.value as EventTypeEnum);
};

/**
 * Checks if an event type is a custom event
 * Pure function - no side effects
 */
export const isCustomEvent = (eventType: EventTypeInterface): boolean => {
  return eventType.value === EventTypeEnum.CUSTOM || eventType.value.startsWith('custom_');
};

/**
 * Gets the category of an event type
 * Pure function - deterministic categorization
 */
export const getEventTypeCategory = (eventType: EventTypeInterface): EventCategory => {
  if (isPageViewEvent(eventType)) return 'page';
  if (isUserActionEvent(eventType)) return 'user_action';
  if (isConversionEvent(eventType)) return 'conversion';
  if (isSystemEvent(eventType)) return 'system';
  if (isCustomEvent(eventType)) return 'custom';
  return 'other';
};

/**
 * Compares two event types for equality
 * Pure function - immutable comparison
 */
export const eventTypesEqual = (a: EventTypeInterface, b: EventTypeInterface): boolean => {
  return a.value === b.value;
};

/**
 * Converts event type to string
 * Pure function - simple value extraction
 */
export const eventTypeToString = (eventType: EventTypeInterface): string => {
  return eventType.value;
};

/**
 * Converts event type to JSON-serializable value
 * Pure function - same as toString for this case
 */
export const eventTypeToJSON = (eventType: EventTypeInterface): string => {
  return eventType.value;
};

/**
 * Creates event type from JSON value
 * Pure function - validates and creates EventType
 */
export const eventTypeFromJSON = (value: string): EventTypeInterface => {
  return createEventType(value);
};

// =============================================================================
// Predefined Event Type Constants
// =============================================================================

export const EVENT_TYPES = {
  // Page and navigation events
  PAGE_VIEW: createEventType(EventTypeEnum.PAGE_VIEW),
  PAGE_LOAD: createEventType(EventTypeEnum.PAGE_LOAD),
  ROUTE_CHANGE: createEventType(EventTypeEnum.ROUTE_CHANGE),

  // User interaction events
  CLICK: createEventType(EventTypeEnum.CLICK),
  FORM_SUBMIT: createEventType(EventTypeEnum.FORM_SUBMIT),
  FORM_FIELD_FOCUS: createEventType(EventTypeEnum.FORM_FIELD_FOCUS),
  SCROLL: createEventType(EventTypeEnum.SCROLL),
  SEARCH: createEventType(EventTypeEnum.SEARCH),
  DOWNLOAD: createEventType(EventTypeEnum.DOWNLOAD),

  // Business conversion events
  LEAD_GENERATED: createEventType(EventTypeEnum.LEAD_GENERATED),
  SIGNUP_STARTED: createEventType(EventTypeEnum.SIGNUP_STARTED),
  SIGNUP_COMPLETED: createEventType(EventTypeEnum.SIGNUP_COMPLETED),
  TRIAL_STARTED: createEventType(EventTypeEnum.TRIAL_STARTED),
  PURCHASE: createEventType(EventTypeEnum.PURCHASE),
  SUBSCRIPTION_CREATED: createEventType(EventTypeEnum.SUBSCRIPTION_CREATED),
  SUBSCRIPTION_CANCELLED: createEventType(EventTypeEnum.SUBSCRIPTION_CANCELLED),

  // Product-specific events
  BOT_CREATED: createEventType(EventTypeEnum.BOT_CREATED),
  BOT_CONFIGURED: createEventType(EventTypeEnum.BOT_CONFIGURED),
  BOT_ACTIVATED: createEventType(EventTypeEnum.BOT_ACTIVATED),
  MESSAGE_SENT: createEventType(EventTypeEnum.MESSAGE_SENT),
  MESSAGE_RECEIVED: createEventType(EventTypeEnum.MESSAGE_RECEIVED),
  WEBHOOK_CONFIGURED: createEventType(EventTypeEnum.WEBHOOK_CONFIGURED),
  INTEGRATION_CONNECTED: createEventType(EventTypeEnum.INTEGRATION_CONNECTED),

  // Performance and technical events
  PERFORMANCE_METRIC: createEventType(EventTypeEnum.PERFORMANCE_METRIC),
  ERROR_OCCURRED: createEventType(EventTypeEnum.ERROR_OCCURRED),
  API_REQUEST: createEventType(EventTypeEnum.API_REQUEST),
  API_ERROR: createEventType(EventTypeEnum.API_ERROR),

  // Marketing and campaign events
  CAMPAIGN_VIEW: createEventType(EventTypeEnum.CAMPAIGN_VIEW),
  AD_CLICK: createEventType(EventTypeEnum.AD_CLICK),
  EMAIL_OPENED: createEventType(EventTypeEnum.EMAIL_OPENED),
  EMAIL_CLICKED: createEventType(EventTypeEnum.EMAIL_CLICKED),

  // System and admin events
  USER_LOGIN: createEventType(EventTypeEnum.USER_LOGIN),
  USER_LOGOUT: createEventType(EventTypeEnum.USER_LOGOUT),
  ADMIN_ACTION: createEventType(EventTypeEnum.ADMIN_ACTION),
  SYSTEM_EVENT: createEventType(EventTypeEnum.SYSTEM_EVENT),

  // Custom events
  CUSTOM: createEventType(EventTypeEnum.CUSTOM),
} as const;

// =============================================================================
// Collection Functions
// =============================================================================

/**
 * Gets all available event types as array
 * Pure function - returns immutable array
 */
export const getAllEventTypes = (): readonly EventTypeInterface[] => {
  return Object.values(EventTypeEnum).map(createEventType);
};

/**
 * Gets all conversion event types
 * Pure function - returns immutable array
 */
export const getConversionEventTypes = (): readonly EventTypeInterface[] => {
  return CONVERSION_EVENTS.map(createEventType);
};

/**
 * Gets all page view event types
 * Pure function - returns immutable array
 */
export const getPageViewEventTypes = (): readonly EventTypeInterface[] => {
  return PAGE_VIEW_EVENTS.map(createEventType);
};

/**
 * Gets all user action event types
 * Pure function - returns immutable array
 */
export const getUserActionEventTypes = (): readonly EventTypeInterface[] => {
  return USER_ACTION_EVENTS.map(createEventType);
};

/**
 * Gets all system event types
 * Pure function - returns immutable array
 */
export const getSystemEventTypes = (): readonly EventTypeInterface[] => {
  return SYSTEM_EVENTS.map(createEventType);
};

// =============================================================================
// Backward Compatibility Layer (DEPRECATED)
// =============================================================================

/**
 * @deprecated Use the functional API instead. This class is kept for backward compatibility.
 * Will be removed in future versions.
 *
 * Migration guide:
 * - Replace `new EventType(value)` with `createEventType(value)`
 * - Replace `EventType.PAGE_VIEW` with `EVENT_TYPES.PAGE_VIEW`
 * - Replace `eventType.isPageView()` with `isPageViewEvent(eventType)`
 * - Replace `eventType.getCategory()` with `getEventTypeCategory(eventType)`
 */
export class EventType {
  private static readonly EVENT_CATEGORIES = EventTypeEnum;

  constructor(public readonly value: string) {
    if (!isValidEventType(value)) {
      throw new Error(`Invalid event type: ${value}`);
    }
  }

  isValid(): boolean {
    return isValidEventType(this.value);
  }

  isPageView(): boolean {
    return isPageViewEvent(this as any);
  }

  isUserAction(): boolean {
    return isUserActionEvent(this as any);
  }

  isConversion(): boolean {
    return isConversionEvent(this as any);
  }

  isSystem(): boolean {
    return isSystemEvent(this as any);
  }

  isCustom(): boolean {
    return isCustomEvent(this as any);
  }

  getCategory(): EventCategory {
    return getEventTypeCategory(this as any);
  }

  equals(other: EventType): boolean {
    return eventTypesEqual(this as any, other as any);
  }

  toString(): string {
    return eventTypeToString(this as any);
  }

  toJSON(): string {
    return eventTypeToJSON(this as any);
  }

  static fromValue(value: string): EventType {
    return new EventType(value);
  }

  static fromJSON(value: string): EventType {
    return new EventType(value);
  }

  // Predefined event types for backward compatibility
  static readonly PAGE_VIEW = new EventType(EventTypeEnum.PAGE_VIEW);
  static readonly PAGE_LOAD = new EventType(EventTypeEnum.PAGE_LOAD);
  static readonly ROUTE_CHANGE = new EventType(EventTypeEnum.ROUTE_CHANGE);
  static readonly CLICK = new EventType(EventTypeEnum.CLICK);
  static readonly FORM_SUBMIT = new EventType(EventTypeEnum.FORM_SUBMIT);
  static readonly FORM_FIELD_FOCUS = new EventType(EventTypeEnum.FORM_FIELD_FOCUS);
  static readonly SCROLL = new EventType(EventTypeEnum.SCROLL);
  static readonly SEARCH = new EventType(EventTypeEnum.SEARCH);
  static readonly DOWNLOAD = new EventType(EventTypeEnum.DOWNLOAD);
  static readonly LEAD_GENERATED = new EventType(EventTypeEnum.LEAD_GENERATED);
  static readonly SIGNUP_STARTED = new EventType(EventTypeEnum.SIGNUP_STARTED);
  static readonly SIGNUP_COMPLETED = new EventType(EventTypeEnum.SIGNUP_COMPLETED);
  static readonly TRIAL_STARTED = new EventType(EventTypeEnum.TRIAL_STARTED);
  static readonly PURCHASE = new EventType(EventTypeEnum.PURCHASE);
  static readonly SUBSCRIPTION_CREATED = new EventType(EventTypeEnum.SUBSCRIPTION_CREATED);
  static readonly SUBSCRIPTION_CANCELLED = new EventType(EventTypeEnum.SUBSCRIPTION_CANCELLED);
  static readonly BOT_CREATED = new EventType(EventTypeEnum.BOT_CREATED);
  static readonly BOT_CONFIGURED = new EventType(EventTypeEnum.BOT_CONFIGURED);
  static readonly BOT_ACTIVATED = new EventType(EventTypeEnum.BOT_ACTIVATED);
  static readonly MESSAGE_SENT = new EventType(EventTypeEnum.MESSAGE_SENT);
  static readonly MESSAGE_RECEIVED = new EventType(EventTypeEnum.MESSAGE_RECEIVED);
  static readonly WEBHOOK_CONFIGURED = new EventType(EventTypeEnum.WEBHOOK_CONFIGURED);
  static readonly INTEGRATION_CONNECTED = new EventType(EventTypeEnum.INTEGRATION_CONNECTED);
  static readonly PERFORMANCE_METRIC = new EventType(EventTypeEnum.PERFORMANCE_METRIC);
  static readonly ERROR_OCCURRED = new EventType(EventTypeEnum.ERROR_OCCURRED);
  static readonly API_REQUEST = new EventType(EventTypeEnum.API_REQUEST);
  static readonly API_ERROR = new EventType(EventTypeEnum.API_ERROR);
  static readonly CAMPAIGN_VIEW = new EventType(EventTypeEnum.CAMPAIGN_VIEW);
  static readonly AD_CLICK = new EventType(EventTypeEnum.AD_CLICK);
  static readonly EMAIL_OPENED = new EventType(EventTypeEnum.EMAIL_OPENED);
  static readonly EMAIL_CLICKED = new EventType(EventTypeEnum.EMAIL_CLICKED);
  static readonly USER_LOGIN = new EventType(EventTypeEnum.USER_LOGIN);
  static readonly USER_LOGOUT = new EventType(EventTypeEnum.USER_LOGOUT);
  static readonly ADMIN_ACTION = new EventType(EventTypeEnum.ADMIN_ACTION);
  static readonly SYSTEM_EVENT = new EventType(EventTypeEnum.SYSTEM_EVENT);
  static readonly CUSTOM = new EventType(EventTypeEnum.CUSTOM);

  static createCustom(name: string): EventType {
    const customEventType = createCustomEventType(name);
    return new EventType(customEventType.value);
  }

  static getAllTypes(): EventType[] {
    return getAllEventTypes().map(et => new EventType(et.value));
  }

  static getConversionTypes(): EventType[] {
    return getConversionEventTypes().map(et => new EventType(et.value));
  }

  static getPageViewTypes(): EventType[] {
    return getPageViewEventTypes().map(et => new EventType(et.value));
  }

  static getUserActionTypes(): EventType[] {
    return getUserActionEventTypes().map(et => new EventType(et.value));
  }

  static getSystemTypes(): EventType[] {
    return getSystemEventTypes().map(et => new EventType(et.value));
  }
}