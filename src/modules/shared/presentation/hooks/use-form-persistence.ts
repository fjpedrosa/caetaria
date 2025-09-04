'use client';

import { useCallback,useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

/**
 * Form Persistence Hook
 *
 * Automatically saves and restores form state to/from localStorage
 * with debounced saving and validation recovery.
 *
 * Features:
 * - Auto-save form data to localStorage
 * - Restore form data on component mount
 * - Debounced saving to prevent excessive writes
 * - Clear persistence when form is submitted successfully
 * - Support for TTL (time-to-live) for persisted data
 * - Handle form validation errors on restore
 */

interface UseFormPersistenceOptions {
  /** Unique key for localStorage storage */
  storageKey: string;
  /** Debounce delay for auto-save in milliseconds */
  debounceMs?: number;
  /** Time-to-live for persisted data in milliseconds */
  ttl?: number;
  /** Whether to exclude specific fields from persistence */
  excludeFields?: string[];
  /** Whether to restore form on mount */
  autoRestore?: boolean;
  /** Callback when data is restored */
  onRestore?: (data: any) => void;
  /** Callback when data is cleared */
  onClear?: () => void;
}

interface PersistedData<T = any> {
  data: T;
  timestamp: number;
  formId?: string;
}

export function useFormPersistence<TFormValues = any>(
  form: UseFormReturn<TFormValues>,
  options: UseFormPersistenceOptions
) {
  const {
    storageKey,
    debounceMs = 1000,
    ttl = 24 * 60 * 60 * 1000, // 24 hours default
    excludeFields = [],
    autoRestore = true,
    onRestore,
    onClear,
  } = options;

  // Save form data to localStorage
  const saveFormData = useCallback((data: TFormValues) => {
    try {
      // Exclude specified fields from persistence
      const filteredData = Object.entries(data as any).reduce((acc, [key, value]) => {
        if (!excludeFields.includes(key)) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const persistedData: PersistedData<TFormValues> = {
        data: filteredData,
        timestamp: Date.now(),
        formId: storageKey,
      };

      localStorage.setItem(storageKey, JSON.stringify(persistedData));
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, [storageKey, excludeFields]);

  // Load form data from localStorage
  const loadFormData = useCallback((): PersistedData<TFormValues> | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const persistedData: PersistedData<TFormValues> = JSON.parse(stored);

      // Check if data has expired
      if (ttl && Date.now() - persistedData.timestamp > ttl) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return persistedData;
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
      localStorage.removeItem(storageKey); // Clean up corrupted data
      return null;
    }
  }, [storageKey, ttl]);

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      onClear?.();
    } catch (error) {
      console.warn('Failed to clear persisted form data:', error);
    }
  }, [storageKey, onClear]);

  // Check if form has persisted data
  const hasPersistedData = useCallback((): boolean => {
    return loadFormData() !== null;
  }, [loadFormData]);

  // Restore form data
  const restoreFormData = useCallback(async () => {
    const persistedData = loadFormData();
    if (!persistedData) return false;

    try {
      // Reset form with persisted data
      form.reset(persistedData.data, {
        keepDefaultValues: false,
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });

      // Re-validate form after restore
      await form.trigger();

      onRestore?.(persistedData.data);
      return true;
    } catch (error) {
      console.warn('Failed to restore form data:', error);
      clearPersistedData();
      return false;
    }
  }, [loadFormData, form, onRestore, clearPersistedData]);

  // Debounced save function
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const subscription = form.watch((data) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (data && Object.keys(data).length > 0) {
          saveFormData(data as TFormValues);
        }
      }, debounceMs);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [form, saveFormData, debounceMs]);

  // Auto-restore on mount
  useEffect(() => {
    if (autoRestore) {
      restoreFormData();
    }
  }, [autoRestore, restoreFormData]);

  return {
    saveFormData,
    loadFormData,
    clearPersistedData,
    restoreFormData,
    hasPersistedData,
  };
}

/**
 * Hook for managing form session recovery
 * Provides UI feedback for form recovery options
 */
export function useFormRecovery<TFormValues = any>(
  form: UseFormReturn<TFormValues>,
  storageKey: string
) {
  const persistence = useFormPersistence(form, {
    storageKey,
    autoRestore: false, // Manual restore for recovery flow
  });

  // Show recovery dialog/notification
  const showRecoveryPrompt = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      // This would typically show a dialog/toast
      // For now, we'll auto-accept if data exists
      const hasData = persistence.hasPersistedData();
      if (hasData) {
        // In a real implementation, you'd show a user prompt here
        const shouldRecover = window.confirm(
          'We found unsaved form data. Would you like to restore it?'
        );
        resolve(shouldRecover);
      } else {
        resolve(false);
      }
    });
  }, [persistence]);

  // Handle recovery flow
  const handleRecovery = useCallback(async () => {
    const shouldRecover = await showRecoveryPrompt();
    if (shouldRecover) {
      const restored = await persistence.restoreFormData();
      return restored;
    }
    return false;
  }, [showRecoveryPrompt, persistence]);

  return {
    ...persistence,
    showRecoveryPrompt,
    handleRecovery,
  };
}