export class EventType {
  private static readonly EVENT_CATEGORIES = {
    // Page and navigation events
    PAGE_VIEW: 'page_view',
    PAGE_LOAD: 'page_load',
    ROUTE_CHANGE: 'route_change',

    // User interaction events
    CLICK: 'click',
    FORM_SUBMIT: 'form_submit',
    FORM_FIELD_FOCUS: 'form_field_focus',
    SCROLL: 'scroll',
    SEARCH: 'search',
    DOWNLOAD: 'download',

    // Business conversion events
    LEAD_GENERATED: 'lead_generated',
    SIGNUP_STARTED: 'signup_started',
    SIGNUP_COMPLETED: 'signup_completed',
    TRIAL_STARTED: 'trial_started',
    PURCHASE: 'purchase',
    SUBSCRIPTION_CREATED: 'subscription_created',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',

    // Product-specific events
    BOT_CREATED: 'bot_created',
    BOT_CONFIGURED: 'bot_configured',
    BOT_ACTIVATED: 'bot_activated',
    MESSAGE_SENT: 'message_sent',
    MESSAGE_RECEIVED: 'message_received',
    WEBHOOK_CONFIGURED: 'webhook_configured',
    INTEGRATION_CONNECTED: 'integration_connected',

    // Performance and technical events
    PERFORMANCE_METRIC: 'performance_metric',
    ERROR_OCCURRED: 'error_occurred',
    API_REQUEST: 'api_request',
    API_ERROR: 'api_error',

    // Marketing and campaign events
    CAMPAIGN_VIEW: 'campaign_view',
    AD_CLICK: 'ad_click',
    EMAIL_OPENED: 'email_opened',
    EMAIL_CLICKED: 'email_clicked',

    // System and admin events
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    ADMIN_ACTION: 'admin_action',
    SYSTEM_EVENT: 'system_event',

    // Custom events
    CUSTOM: 'custom',
  } as const;

  private static readonly PAGE_VIEW_EVENTS = [
    EventType.EVENT_CATEGORIES.PAGE_VIEW,
    EventType.EVENT_CATEGORIES.PAGE_LOAD,
    EventType.EVENT_CATEGORIES.ROUTE_CHANGE,
  ];

  private static readonly USER_ACTION_EVENTS = [
    EventType.EVENT_CATEGORIES.CLICK,
    EventType.EVENT_CATEGORIES.FORM_SUBMIT,
    EventType.EVENT_CATEGORIES.FORM_FIELD_FOCUS,
    EventType.EVENT_CATEGORIES.SCROLL,
    EventType.EVENT_CATEGORIES.SEARCH,
    EventType.EVENT_CATEGORIES.DOWNLOAD,
  ];

  private static readonly CONVERSION_EVENTS = [
    EventType.EVENT_CATEGORIES.LEAD_GENERATED,
    EventType.EVENT_CATEGORIES.SIGNUP_STARTED,
    EventType.EVENT_CATEGORIES.SIGNUP_COMPLETED,
    EventType.EVENT_CATEGORIES.TRIAL_STARTED,
    EventType.EVENT_CATEGORIES.PURCHASE,
    EventType.EVENT_CATEGORIES.SUBSCRIPTION_CREATED,
  ];

  private static readonly SYSTEM_EVENTS = [
    EventType.EVENT_CATEGORIES.PERFORMANCE_METRIC,
    EventType.EVENT_CATEGORIES.ERROR_OCCURRED,
    EventType.EVENT_CATEGORIES.API_REQUEST,
    EventType.EVENT_CATEGORIES.API_ERROR,
    EventType.EVENT_CATEGORIES.SYSTEM_EVENT,
  ];

  constructor(public readonly value: string) {
    if (!this.isValid()) {
      throw new Error(`Invalid event type: ${value}`);
    }
  }

  isValid(): boolean {
    return Object.values(EventType.EVENT_CATEGORIES).includes(this.value as any) ||
           this.value.startsWith('custom_');
  }

  isPageView(): boolean {
    return EventType.PAGE_VIEW_EVENTS.includes(this.value as any);
  }

  isUserAction(): boolean {
    return EventType.USER_ACTION_EVENTS.includes(this.value as any);
  }

  isConversion(): boolean {
    return EventType.CONVERSION_EVENTS.includes(this.value as any);
  }

  isSystem(): boolean {
    return EventType.SYSTEM_EVENTS.includes(this.value as any);
  }

  isCustom(): boolean {
    return this.value === EventType.EVENT_CATEGORIES.CUSTOM || this.value.startsWith('custom_');
  }

  getCategory(): 'page' | 'user_action' | 'conversion' | 'system' | 'custom' | 'other' {
    if (this.isPageView()) return 'page';
    if (this.isUserAction()) return 'user_action';
    if (this.isConversion()) return 'conversion';
    if (this.isSystem()) return 'system';
    if (this.isCustom()) return 'custom';
    return 'other';
  }

  equals(other: EventType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  static fromValue(value: string): EventType {
    return new EventType(value);
  }

  static fromJSON(value: string): EventType {
    return new EventType(value);
  }

  // Predefined event types for common use cases
  static readonly PAGE_VIEW = new EventType(EventType.EVENT_CATEGORIES.PAGE_VIEW);
  static readonly PAGE_LOAD = new EventType(EventType.EVENT_CATEGORIES.PAGE_LOAD);
  static readonly ROUTE_CHANGE = new EventType(EventType.EVENT_CATEGORIES.ROUTE_CHANGE);

  static readonly CLICK = new EventType(EventType.EVENT_CATEGORIES.CLICK);
  static readonly FORM_SUBMIT = new EventType(EventType.EVENT_CATEGORIES.FORM_SUBMIT);
  static readonly FORM_FIELD_FOCUS = new EventType(EventType.EVENT_CATEGORIES.FORM_FIELD_FOCUS);
  static readonly SCROLL = new EventType(EventType.EVENT_CATEGORIES.SCROLL);
  static readonly SEARCH = new EventType(EventType.EVENT_CATEGORIES.SEARCH);
  static readonly DOWNLOAD = new EventType(EventType.EVENT_CATEGORIES.DOWNLOAD);

  static readonly LEAD_GENERATED = new EventType(EventType.EVENT_CATEGORIES.LEAD_GENERATED);
  static readonly SIGNUP_STARTED = new EventType(EventType.EVENT_CATEGORIES.SIGNUP_STARTED);
  static readonly SIGNUP_COMPLETED = new EventType(EventType.EVENT_CATEGORIES.SIGNUP_COMPLETED);
  static readonly TRIAL_STARTED = new EventType(EventType.EVENT_CATEGORIES.TRIAL_STARTED);
  static readonly PURCHASE = new EventType(EventType.EVENT_CATEGORIES.PURCHASE);
  static readonly SUBSCRIPTION_CREATED = new EventType(EventType.EVENT_CATEGORIES.SUBSCRIPTION_CREATED);
  static readonly SUBSCRIPTION_CANCELLED = new EventType(EventType.EVENT_CATEGORIES.SUBSCRIPTION_CANCELLED);

  static readonly BOT_CREATED = new EventType(EventType.EVENT_CATEGORIES.BOT_CREATED);
  static readonly BOT_CONFIGURED = new EventType(EventType.EVENT_CATEGORIES.BOT_CONFIGURED);
  static readonly BOT_ACTIVATED = new EventType(EventType.EVENT_CATEGORIES.BOT_ACTIVATED);
  static readonly MESSAGE_SENT = new EventType(EventType.EVENT_CATEGORIES.MESSAGE_SENT);
  static readonly MESSAGE_RECEIVED = new EventType(EventType.EVENT_CATEGORIES.MESSAGE_RECEIVED);
  static readonly WEBHOOK_CONFIGURED = new EventType(EventType.EVENT_CATEGORIES.WEBHOOK_CONFIGURED);
  static readonly INTEGRATION_CONNECTED = new EventType(EventType.EVENT_CATEGORIES.INTEGRATION_CONNECTED);

  static readonly PERFORMANCE_METRIC = new EventType(EventType.EVENT_CATEGORIES.PERFORMANCE_METRIC);
  static readonly ERROR_OCCURRED = new EventType(EventType.EVENT_CATEGORIES.ERROR_OCCURRED);
  static readonly API_REQUEST = new EventType(EventType.EVENT_CATEGORIES.API_REQUEST);
  static readonly API_ERROR = new EventType(EventType.EVENT_CATEGORIES.API_ERROR);

  static readonly CAMPAIGN_VIEW = new EventType(EventType.EVENT_CATEGORIES.CAMPAIGN_VIEW);
  static readonly AD_CLICK = new EventType(EventType.EVENT_CATEGORIES.AD_CLICK);
  static readonly EMAIL_OPENED = new EventType(EventType.EVENT_CATEGORIES.EMAIL_OPENED);
  static readonly EMAIL_CLICKED = new EventType(EventType.EVENT_CATEGORIES.EMAIL_CLICKED);

  static readonly USER_LOGIN = new EventType(EventType.EVENT_CATEGORIES.USER_LOGIN);
  static readonly USER_LOGOUT = new EventType(EventType.EVENT_CATEGORIES.USER_LOGOUT);
  static readonly ADMIN_ACTION = new EventType(EventType.EVENT_CATEGORIES.ADMIN_ACTION);
  static readonly SYSTEM_EVENT = new EventType(EventType.EVENT_CATEGORIES.SYSTEM_EVENT);

  static readonly CUSTOM = new EventType(EventType.EVENT_CATEGORIES.CUSTOM);

  static createCustom(name: string): EventType {
    return new EventType(`custom_${name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`);
  }

  static getAllTypes(): EventType[] {
    return Object.values(EventType.EVENT_CATEGORIES).map(value => new EventType(value));
  }

  static getConversionTypes(): EventType[] {
    return EventType.CONVERSION_EVENTS.map(value => new EventType(value));
  }

  static getPageViewTypes(): EventType[] {
    return EventType.PAGE_VIEW_EVENTS.map(value => new EventType(value));
  }

  static getUserActionTypes(): EventType[] {
    return EventType.USER_ACTION_EVENTS.map(value => new EventType(value));
  }

  static getSystemTypes(): EventType[] {
    return EventType.SYSTEM_EVENTS.map(value => new EventType(value));
  }
}