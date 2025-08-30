/**
 * WhatsApp Simulator Module - Main exports
 */

// Domain Entities
export * from './domain/entities';
export * from './domain/events';

// Application Layer
export * from './application/engines/conversation-engine';
export * from './application/use-cases';

// UI Layer
export * from './ui/hooks';
export * from './ui/components/conversation-simulator';
export * from './ui/components/whatsapp-simulator';
export * from './ui/components/export-controls';

// Infrastructure
export * from './infra/factories/conversation-factory';
export * from './infra/services/gif-export';

// Scenarios
export * from './scenarios/restaurant-reservation-scenario';