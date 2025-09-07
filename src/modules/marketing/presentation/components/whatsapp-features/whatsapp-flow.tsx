/**
 * WhatsApp Flow Component
 * Simulates native WhatsApp Flows for interactive forms
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

import type { WhatsAppFlow, WhatsAppFlowStep } from '@/modules/marketing/domain/types/whatsapp-features.types';

interface WhatsAppFlowProps {
  flow: WhatsAppFlow;
  onSubmit?: (data: Record<string, any>) => void;
  onClose?: () => void;
  isVisible: boolean;
}

export function WhatsAppFlowComponent({ 
  flow, 
  onSubmit, 
  onClose,
  isVisible 
}: WhatsAppFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = flow.steps[currentStepIndex];
  const isLastStep = currentStepIndex === flow.steps.length - 1;
  const progress = ((currentStepIndex + 1) / flow.steps.length) * 100;

  // Reset when flow changes
  useEffect(() => {
    if (isVisible) {
      setCurrentStepIndex(0);
      setFormData({});
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isVisible, flow.id]);

  const validateStep = useCallback((step: WhatsAppFlowStep, value: any): string | null => {
    if (step.required && !value) {
      return 'Este campo es obligatorio';
    }

    if (step.validation) {
      if (step.validation.pattern) {
        const regex = new RegExp(step.validation.pattern);
        if (!regex.test(value)) {
          return step.validation.message || 'Formato inválido';
        }
      }

      if (step.type === 'number-input') {
        const numValue = Number(value);
        if (step.validation.min !== undefined && numValue < step.validation.min) {
          return `El valor mínimo es ${step.validation.min}`;
        }
        if (step.validation.max !== undefined && numValue > step.validation.max) {
          return `El valor máximo es ${step.validation.max}`;
        }
      }
    }

    return null;
  }, []);

  const handleNext = useCallback(() => {
    const error = validateStep(currentStep, formData[currentStep.id]);
    
    if (error) {
      setErrors({ ...errors, [currentStep.id]: error });
      return;
    }

    setErrors({ ...errors, [currentStep.id]: '' });

    if (isLastStep) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit?.(formData);
        setIsSubmitting(false);
      }, 1000);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStep, currentStepIndex, errors, formData, isLastStep, onSubmit, validateStep]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const handleInputChange = useCallback((stepId: string, value: any) => {
    setFormData({ ...formData, [stepId]: value });
    // Clear error when user starts typing
    if (errors[stepId]) {
      setErrors({ ...errors, [stepId]: '' });
    }
  }, [formData, errors]);

  const renderStepInput = () => {
    switch (currentStep.type) {
      case 'text-input':
      case 'number-input':
        return (
          <input
            type={currentStep.type === 'number-input' ? 'number' : 'text'}
            placeholder={currentStep.placeholder}
            value={formData[currentStep.id] || ''}
            onChange={(e) => handleInputChange(currentStep.id, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            autoFocus
          />
        );

      case 'date-picker':
        return (
          <input
            type="date"
            value={formData[currentStep.id] || ''}
            onChange={(e) => handleInputChange(currentStep.id, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            min={new Date().toISOString().split('T')[0]}
          />
        );

      case 'time-picker':
        return (
          <input
            type="time"
            value={formData[currentStep.id] || ''}
            onChange={(e) => handleInputChange(currentStep.id, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
        );

      case 'single-select':
        return (
          <div className="space-y-2">
            {currentStep.options?.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => handleInputChange(currentStep.id, option.value)}
                className={`w-full px-4 py-3 text-left rounded-xl transition-all ${
                  formData[currentStep.id] === option.value
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {formData[currentStep.id] === option.value && (
                    <Check className="w-5 h-5" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'multi-select':
        return (
          <div className="space-y-2">
            {currentStep.options?.map((option) => {
              const selected = formData[currentStep.id]?.includes(option.value) || false;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => {
                    const currentValues = formData[currentStep.id] || [];
                    const newValues = selected
                      ? currentValues.filter((v: any) => v !== option.value)
                      : [...currentValues, option.value];
                    handleInputChange(currentStep.id, newValues);
                  }}
                  className={`w-full px-4 py-3 text-left rounded-xl transition-all ${
                    selected
                      ? 'bg-green-100 border-2 border-green-500 text-gray-900'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-900'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[currentStep.id] || ''}
            onChange={(e) => handleInputChange(currentStep.id, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          >
            <option value="">Selecciona una opción</option>
            {currentStep.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white z-50 flex flex-col"
        >
          {/* Header */}
          <div className="bg-green-500 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className="p-1 hover:bg-green-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold text-lg">{flow.title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-green-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-green-600 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="mt-2 text-sm opacity-90">
              Paso {currentStepIndex + 1} de {flow.steps.length}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentStep.label}
                </h4>
                
                {renderStepInput()}
                
                {errors[currentStep.id] && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500"
                  >
                    {errors[currentStep.id]}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <motion.button
              onClick={handleNext}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 active:scale-98'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : isLastStep ? (
                <>
                  {flow.submitButton.text}
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continuar
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}