/**
 * GIF Export Service - Main Export
 * Centralized exports for all GIF export functionality
 */

// Types and interfaces (re-exported from domain layer)
export * from '../../../domain/types/gif-export-types';

// Main service
export { gifExportService, GifExportServiceImpl } from './gif-export.service';

// Utilities
export { gifCaptureUtils, GifCaptureUtilsImpl } from './gif-capture.utils';
export { gifOptimizationUtils, GifOptimizationUtilsImpl } from './gif-optimization.utils';

// React hooks and components are exported from the UI layer
// This maintains clean separation of concerns