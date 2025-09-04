/**
 * WhatsApp Simulator Domain Types - Centralized type definitions
 * Following Clean Architecture principles with all interfaces in one place
 */

import type { Conversation, Message } from './entities';

// =============================================================================
// SIMULATOR CONFIGURATION TYPES
// =============================================================================

export type DeviceType = 'iphone14' | 'android';

export interface WhatsAppSimulatorProps {
  scenario?: any; // Will be refactored to proper scenario type
  device?: DeviceType;
  autoPlay?: boolean;
  isInView?: boolean; // Controls auto-restart behavior based on visibility
  enableEducationalBadges?: boolean;
  enableGifExport?: boolean;
  onComplete?: () => void;
  onBadgeShow?: (badge: EducationalBadge) => void;
  onFlowStep?: (step: FlowStepData) => void;
  className?: string;
}

// =============================================================================
// EDUCATIONAL BADGE TYPES
// =============================================================================

export interface EducationalBadge {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'tip' | 'warning' | 'feature';
  position: {
    x: number;
    y: number;
  };
  triggerMessageIndex?: number;
  duration?: number;
  priority: 'low' | 'medium' | 'high';
}

// =============================================================================
// FLOW EXECUTION TYPES
// =============================================================================

export interface ExecutionConfig {
  enableMockExecution: boolean;
  autoCompleteFlows: boolean;
  debugMode?: boolean;
  timeoutMs?: number;
}

export type FlowStepId = 'guests' | 'date' | 'time' | 'confirmation';

export interface FlowStepData {
  id: FlowStepId;
  title: string;
  description?: string;
  isActive: boolean;
  isCompleted: boolean;
  data?: Record<string, any>;
}

export interface ReservationData {
  guests: number;
  date: string;
  time: string;
}

export interface FlowExecutionState {
  currentStep: FlowStepId;
  completedSteps: FlowStepId[];
  flowData: ReservationData;
  isFlowActive: boolean;
  isFlowCompleted: boolean;
}

// =============================================================================
// CONVERSATION FLOW TYPES
// =============================================================================

export interface ConversationFlowConfig {
  enableDebug: boolean;
  autoCleanup: boolean;
  playbackSpeed?: number;
  autoAdvance?: boolean;
}

// Alias for backwards compatibility
export type FlowConfig = ConversationFlowConfig;

export interface ConversationFlowState {
  conversation: Conversation | null;
  isInitialized: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentMessageIndex: number;
  error?: string;
}

export interface ConversationFlowActions {
  loadConversation: (conversation: Conversation) => Promise<boolean>;
  play: () => void;
  pause: () => void;
  reset: () => void;
  jumpToMessage: (index: number) => void;
  setPlaybackSpeed: (speed: number) => void;
}

// =============================================================================
// TYPING INDICATOR TYPES
// =============================================================================

export interface TypingIndicatorConfig {
  showTypingIndicator: boolean;
  animationDuration: number;
  customMessages?: string[];
}

// Alias for backwards compatibility
export type TypingConfig = TypingIndicatorConfig;

export interface TypingIndicatorState {
  isVisible: boolean;
  currentMessage?: string;
  senderName?: string;
  progress: number;
}

// =============================================================================
// PERFORMANCE MONITORING TYPES
// =============================================================================

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  memoryUsage?: number;
  fpsCount?: number;
  animationFrameCount: number;
}

export interface PerformanceConfig {
  enableMonitoring: boolean;
  sampleRate: number;
  maxSamples: number;
  reportInterval: number;
}

// =============================================================================
// GIF EXPORT TYPES
// =============================================================================

export interface GifExportConfig {
  enabled: boolean;
  quality: number;
  width: number;
  height?: number;
  frameRate: number;
  optimize: boolean;
}

export interface GifExportState {
  isExporting: boolean;
  progress: number;
  error?: string;
  exportUrl?: string;
  fileSize?: number;
}

export interface GifExportOptions {
  includeTypingIndicators: boolean;
  includeBadges: boolean;
  customBackground?: string;
  watermark?: {
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

// =============================================================================
// SCENARIO TEMPLATE TYPES
// =============================================================================

export interface ScenarioMetadata {
  id: string;
  title: string;
  description: string;
  tags: string[];
  businessName: string;
  businessPhoneNumber: string;
  userPhoneNumber: string;
  language: string;
  category?: string;
  estimatedDuration?: number;
}

export interface ScenarioMessage {
  sender: 'user' | 'business';
  type: 'text' | 'interactive' | 'flow';
  content: string;
  delayBeforeTyping?: number;
  typingDuration?: number;
  metadata?: Record<string, any>;
}

export interface ConversationTemplate {
  metadata: ScenarioMetadata;
  messages: ScenarioMessage[];
  settings: {
    playbackSpeed: number;
    autoAdvance: boolean;
    showTypingIndicators: boolean;
    showReadReceipts: boolean;
  };
  badges?: EducationalBadge[];
  flows?: FlowStepData[];
}

// =============================================================================
// SIMULATOR STATE TYPES
// =============================================================================

export interface SimulatorState {
  // Core state
  conversation: Conversation | null;
  isInitialized: boolean;

  // Flow state
  flowExecution: FlowExecutionState;

  // UI state
  activeBadge: EducationalBadge | null;
  showFlow: boolean;

  // Performance state
  metrics: PerformanceMetrics;

  // Export state
  gifExport: GifExportState;
}

export interface SimulatorActions {
  // Initialization
  initialize: (scenario: ConversationTemplate) => Promise<void>;
  reset: () => void;

  // Playback control
  play: () => void;
  pause: () => void;
  jumpTo: (index: number) => void;

  // Flow control
  nextFlowStep: () => void;
  updateFlowData: (data: Partial<ReservationData>) => void;

  // Badge control
  showBadge: (badge: EducationalBadge) => void;
  hideBadge: () => void;

  // Export control
  startGifExport: (options?: GifExportOptions) => Promise<void>;
  cancelGifExport: () => void;
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

export interface UseWhatsAppSimulatorReturn {
  // State
  state: SimulatorState;

  // Actions
  actions: SimulatorActions;

  // Derived state
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentProgress: number;

  // Event handlers
  onMessageClick: (index: number) => void;
  onFlowStepClick: (stepId: FlowStepId) => void;
  onBadgeClick: (badge: EducationalBadge) => void;
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface WhatsAppSimulatorViewProps extends WhatsAppSimulatorProps {
  hookData: UseWhatsAppSimulatorReturn;
}

export interface ConversationDisplayProps {
  conversation: Conversation | null;
  currentMessageIndex: number;
  isPlaying: boolean;
  typingState: TypingIndicatorState;
  onMessageClick: (index: number) => void;
  className?: string;
}

export interface FlowDisplayProps {
  flowState: FlowExecutionState;
  onStepClick: (stepId: FlowStepId) => void;
  onDataUpdate: (data: Partial<ReservationData>) => void;
  className?: string;
}

export interface BadgeDisplayProps {
  badge: EducationalBadge | null;
  onBadgeClick: (badge: EducationalBadge) => void;
  onClose: () => void;
  className?: string;
}

export interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onProgressChange: (progress: number) => void;
  className?: string;
}

// Educational Badge Component Props
export interface EducationalBadgeProps {
  badge: EducationalBadge;
  isMobile?: boolean;
  className?: string;
}

export interface EducationalBadgeDesktopProps {
  badge: EducationalBadge;
  className?: string;
}

export interface EducationalBadgeMobileProps {
  badge: EducationalBadge;
  className?: string;
}

// WhatsApp Simulator Presentational Props
export interface WhatsAppSimulatorPresentationalProps {
  // Core state
  conversation: Conversation | null;
  isInitialized: boolean;
  activeBadge: any;
  showFlow: boolean;
  flowStep: FlowStepId;
  reservationData: ReservationData;

  // Configuration
  device: 'iphone14' | 'android';
  enableEducationalBadges: boolean;
  className: string;

  // Hooks data
  conversationFlow: any;
  typingIndicator: any;
  flowExecution: any;

  // Event handlers
  onDataChange: (data: ReservationData) => void;
}

// Flow Panel Component Props
export interface FlowPanelProps {
  step: FlowStepId;
  reservationData: ReservationData;
  onDataChange: (data: ReservationData) => void;
  className?: string;
  heroCompatible?: boolean;
}

export interface FlowStepProps {
  onNext: (data: Partial<ReservationData>) => void;
  data: ReservationData;
  heroCompatible?: boolean;
}

// Conversation Simulator Component Props
export interface ConversationSimulatorProps {
  conversation: Conversation;
  className?: string;
  onMessageSent?: (message: Message) => void;
  onConversationComplete?: () => void;
  onError?: (error: Error) => void;
  enableDebug?: boolean;
  /** Enable GIF export functionality */
  enableGifExport?: boolean;
  /** Callback when GIF export starts */
  onGifExportStart?: () => void;
  /** Callback when GIF export completes */
  onGifExportComplete?: (result: any) => void;
  /** Callback when GIF export fails */
  onGifExportError?: (error: any) => void;
}

// Export Controls Component Props
export interface ExportControlsProps {
  /** Target element to export */
  targetElement: HTMLElement | null;
  /** Whether controls are visible */
  isVisible?: boolean;
  /** Callback when export starts */
  onExportStart?: () => void;
  /** Callback when export completes */
  onExportComplete?: (result: any) => void;
  /** Callback when export fails */
  onExportError?: (error: any) => void;
  /** Custom class name */
  className?: string;
}

// Vertical Selector Component Types
export interface VerticalOption {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  examples: string[];
}

export interface VerticalSelectorProps {
  selectedVertical: string;
  onVerticalChange: (vertical: string) => void;
  availableScenarios: Record<string, any>; // ScenarioOption type from scenarios
  className?: string;
}

// Demo With Selector Component Props
export interface DemoWithSelectorProps {
  isInView: boolean;
  enableEducationalBadges?: boolean;
  autoPlay?: boolean;
  device?: 'iphone14' | 'android';
  className?: string;
}

// WhatsApp Simulator Hook Return Type (detailed)
export interface UseWhatsAppSimulatorDetailedReturn {
  // Core state
  conversation: Conversation | null;
  isInitialized: boolean;

  // Badge management
  activeBadge: any;

  // Flow management
  showFlow: boolean;
  flowStep: any;
  reservationData: any;

  // Actions
  initializeConversation: () => Promise<void>;

  // Hooks for component consumption
  conversationFlow: any;
  typingIndicator: any;
  flowExecution: any;

  // Event handlers
  handleDataChange: (data: any) => void;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface SimulatorError {
  type: 'initialization' | 'playback' | 'export' | 'flow' | 'unknown';
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

export interface ErrorState {
  hasError: boolean;
  error?: SimulatorError;
  retryCount: number;
}

// =============================================================================
// HOOK TYPES - Flow Execution
// =============================================================================

export interface FlowState {
  flowId: string;
  flowToken: string;
  isActive: boolean;
  isCompleted: boolean;
  hasError: boolean;
  error?: Error;
  data: Record<string, any>;
  result?: Record<string, any>;
  startTime?: Date;
  endTime?: Date;
  executionTime?: number;
}

export interface FlowExecutionConfig {
  enableMockExecution: boolean;
  mockExecutionDelay: number;
  autoCompleteFlows: boolean;
  mockFlowResponses: Record<string, Record<string, any>>;
  maxExecutionTime: number;
  enableDebug: boolean;
}

export interface FlowExecutionActions {
  triggerFlow: (message: Message, flowData?: Record<string, any>) => Promise<boolean>;
  completeFlow: (flowToken: string, result: Record<string, any>) => Promise<boolean>;
  cancelFlow: (flowToken: string, reason?: string) => Promise<boolean>;
  getFlowState: (flowToken: string) => FlowState | null;
  getActiveFlows: () => FlowState[];
  clearFlowHistory: () => void;
  setMockFlowResponse: (flowId: string, response: Record<string, any>) => void;
}

export interface FlowExecutionReturn {
  state: FlowExecutionState;
  actions: FlowExecutionActions;
}

// =============================================================================
// HOOK TYPES - Message Timing
// =============================================================================

export interface TimingConfig {
  baseTypingSpeed: number;
  variationFactor: number;
  baseDelay: number;
  animationDuration: number;
  readDelay: number;
  flowTransitionDelay: number;
  typingIndicatorBuffer: number;
  minTypingDuration: number;
  maxTypingDuration: number;
}

export interface CalculatedTiming {
  delayBeforeTyping: number;
  typingDuration: number;
  readDelay: number;
  totalDuration: number;
  animationDuration: number;
}

export interface TimingUtilities {
  calculateForMessage: (message: Message) => CalculatedTiming;
  calculateForText: (text: string, sender?: 'user' | 'business') => CalculatedTiming;
  getTotalDuration: (messages: Message[]) => number;
  calculatePlaybackTime: (messages: Message[], playbackSpeed: number) => number;
  getEstimatedTimeToMessage: (messages: Message[], targetIndex: number) => number;
}

// =============================================================================
// HOOK TYPES - Educational Badges
// =============================================================================

export interface UseEducationalBadgesOptions {
  autoShowInterval?: number;
  maxConcurrentBadges?: number;
  enableAnimation?: boolean;
  enableMobile?: boolean;
  badgeDisplayDuration?: number;
  badgePriority?: 'low' | 'medium' | 'high';
  enableAnalytics?: boolean;
}

export interface EducationalBadgesResult {
  activeBadge: EducationalBadge | null;
  activeBadges: EducationalBadge[];
  badgeQueue: EducationalBadge[];
  shownBadges: Set<string>;
  handleBadgeDisplay: (badge: EducationalBadge | null) => void;
  dismissBadge: (badgeId?: string) => void;
  dismissAllBadges: () => void;
  clearBadge: () => void;
  showBadge: (badge: EducationalBadge) => void;
  canShowBadge: (badge: EducationalBadge) => boolean;
  isShowingBadge: boolean;
  badgeStats: {
    totalShown: number;
    currentQueue: number;
    averageDisplayTime: number;
  };
}

export interface BadgeAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  type?: 'bounce' | 'fade' | 'slide' | 'scale' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  intensity?: 'low' | 'medium' | 'high';
}

export interface BadgeAccessibilityOptions {
  announceToScreenReader?: boolean;
  highContrastMode?: boolean;
  reduceMotion?: boolean;
  keyboardNavigable?: boolean;
  focusTrapEnabled?: boolean;
  ariaLive?: 'polite' | 'assertive' | 'off';
  ariaRole?: string;
}

// =============================================================================
// HOOK TYPES - Reservation Data
// =============================================================================

export interface UseReservationDataOptions {
  defaultGuests?: number;
  defaultDate?: string;
  defaultTime?: string;
  enableValidation?: boolean;
  minGuests?: number;
  maxGuests?: number;
  availableDates?: string[];
  availableTimeSlots?: string[];
}

export interface ReservationDataResult {
  reservationData: ReservationData;
  updateReservationData: (data: Partial<ReservationData>) => void;
  resetReservationData: () => void;
  isValid: boolean;
  validationErrors: string[];
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getSummary: () => string;
}

export interface AutoReservationOptions {
  autoFillEnabled?: boolean;
  autoAdvanceSteps?: boolean;
  mockDelay?: number;
  defaultValues?: Partial<ReservationData>;
  randomizeValues?: boolean;
}

// =============================================================================
// HOOK TYPES - Flow Sequence
// =============================================================================

export interface UseFlowSequenceReturn {
  showFlow: boolean;
  flowStep: FlowStepId;
  reservationData: ReservationData;
  setFlowStep: (step: FlowStepId) => void;
  setShowFlow: (show: boolean) => void;
  startFlowSequence: () => void;
  updateReservationData: (data: ReservationData) => void;
  resetFlow: () => void;
  isFlowCompleted: boolean;
  currentStepIndex: number;
  totalSteps: number;
}

export interface FlowSequenceConfig {
  scenario?: any;
  onFlowStep?: (step: any) => void;
  autoAdvance?: boolean;
  stepDelay?: number;
}

// =============================================================================
// HOOK TYPES - GIF Export
// =============================================================================

export interface UseGifExportOptions {
  defaultPreset?: keyof typeof import('./types/gif-export-types').EXPORT_PRESETS;
  autoOptimize?: boolean;
  enableProgress?: boolean;
  onExportStart?: () => void;
  onExportComplete?: (result: any) => void;
  onExportError?: (error: any) => void;
  maxMemoryUsage?: number;
  enableCaching?: boolean;
}

export interface GifExportState {
  status: 'idle' | 'preparing' | 'capturing' | 'processing' | 'encoding' | 'complete' | 'error';
  progress: number;
  options: import('./types/gif-export-types').ExportOptions;
  result: import('./types/gif-export-types').ExportResult | null;
  error: import('./types/gif-export-types').ExportError | null;
  isExporting: boolean;
  currentFrame: number;
  totalFrames: number;
  memoryUsage: {
    current: number;
    peak: number;
    limit: number;
    nearLimit: boolean;
  };
  progressDetails: {
    message: string;
    currentFrame?: number;
    totalFrames?: number;
    estimatedTimeRemaining?: number;
  } | null;
}

export interface GifExportActions {
  exportGif: (element: HTMLElement) => Promise<void>;
  cancelExport: () => void;
  setPreset: (preset: keyof typeof import('./types/gif-export-types').EXPORT_PRESETS) => void;
  updateOptions: (options: Partial<import('./types/gif-export-types').ExportOptions>) => void;
  downloadGif: (filename?: string) => void;
  getBlobUrl: () => string | null;
  reset: () => void;
  optimizeSettings: (element: HTMLElement) => void;
}

// =============================================================================
// RE-EXPORTS FOR COMPATIBILITY
// =============================================================================

// Re-export Message type from entities for components that need it
export type { Message } from './entities';