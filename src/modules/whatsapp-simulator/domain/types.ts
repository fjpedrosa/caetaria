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