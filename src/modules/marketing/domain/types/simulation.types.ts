/**
 * Simulation Domain Types
 * Core types for WhatsApp conversation simulations
 */

import { LucideIcon } from 'lucide-react';

/**
 * Types of simulations available
 */
export type SimulationType =
  | 'restaurant-reservation'
  | 'restaurant-orders'
  | 'medical-appointments'
  | 'loyalty-program';

/**
 * Base message structure for WhatsApp conversations
 */
export interface BaseMessage {
  id: string;
  type: 'customer' | 'bot';
  content: string;
  timestamp: Date;
  isRead?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Flow option for interactive selections
 */
export interface FlowOption {
  id: string;
  label: string;
  value: any;
  icon?: LucideIcon | string;
  disabled?: boolean;
}

/**
 * Flow step definition
 */
export interface FlowStep {
  id: string;
  type: 'selection' | 'input' | 'date' | 'time' | 'confirmation' | 'multi-select';
  title: string;
  subtitle?: string;
  options?: FlowOption[];
  validation?: (value: any) => boolean | string;
  required?: boolean;
  placeholder?: string;
}

/**
 * Flow definition for interactive scenarios
 */
export interface FlowDefinition {
  id: string;
  trigger: 'message' | 'button' | 'timer' | 'auto';
  triggerDelay?: number;
  steps: FlowStep[];
  onComplete?: (data: Record<string, any>) => void;
}

/**
 * Complete simulation scenario
 */
export interface SimulationScenario {
  id: SimulationType;
  name: string;
  businessName: string;
  description: string;
  icon: LucideIcon;
  messages: BaseMessage[];
  flows: FlowDefinition[];
  duration: number;
  loop?: boolean;
  analytics?: {
    conversionRate: number;
    avgResponseTime: number;
    satisfactionScore: number;
  };
}

/**
 * Simulation state management
 */
export interface SimulationState {
  currentScenario: SimulationType;
  messagePhase: number;
  isTyping: boolean;
  typingEntity: 'customer' | 'bot' | null;
  flowActive: boolean;
  currentFlow: string | null;
  flowStep: string | null;
  collectedData: Record<string, any>;
  animationSpeed: number;
  isPaused: boolean;
  isComplete: boolean;
}

/**
 * Animation action types
 */
export type AnimationActionType =
  | 'show-message'
  | 'start-typing'
  | 'stop-typing'
  | 'show-flow'
  | 'next-flow-step'
  | 'hide-flow'
  | 'complete'
  | 'reset';

/**
 * Animation action
 */
export interface AnimationAction {
  type: AnimationActionType;
  entity?: 'customer' | 'bot';
  messageId?: string;
  flowId?: string;
  stepId?: string;
  data?: any;
}

/**
 * Message sequence item for animation timeline
 */
export interface MessageSequenceItem {
  phase: number;
  delay: number;
  action: AnimationAction;
}

/**
 * Simulation engine options
 */
export interface SimulationEngineOptions {
  initialScenario?: SimulationType;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  onScenarioComplete?: (scenario: SimulationType) => void;
  onFlowComplete?: (flowId: string, data: Record<string, any>) => void;
  onMessageShown?: (message: BaseMessage) => void;
  debug?: boolean;
}

/**
 * Simulation metrics for analytics
 */
export interface SimulationMetrics {
  messagesShown: number;
  flowsCompleted: number;
  totalDuration: number;
  userInteractions: number;
  completionRate: number;
}