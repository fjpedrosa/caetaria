/**
 * Flow Panel Component
 * Pure presentational component for WhatsApp Flow interface
 * Extracted from original WhatsAppSimulator following Clean Architecture principles
 */

'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type {
  FlowPanelProps,
  FlowStepId,
  FlowStepProps,
  ReservationData} from '../../domain/types';
import { flowSequenceHelpers } from '../hooks/use-flow-sequence';
import { heroCompatibleHelpers,reservationDataHelpers } from '../hooks/use-reservation-data';

// ============================================================================
// ============================================================================

/**
 * Flow Panel - Main container for WhatsApp Flow steps
 */
export const FlowPanel: React.FC<FlowPanelProps> = ({
  step,
  reservationData,
  onDataChange,
  className = '',
  heroCompatible = false
}) => {
  const handleFlowNext = (data: Partial<ReservationData>) => {
    onDataChange({ ...reservationData, ...data });
  };

  const currentStepNumber = flowSequenceHelpers.getStepNumber(step);
  const totalSteps = flowSequenceHelpers.getTotalSteps();
  const stepTitle = flowSequenceHelpers.getStepTitle(step);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Flow header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-900">Reserva tu mesa</h2>
          <p className="text-sm text-gray-500">
            Paso {currentStepNumber} de {totalSteps}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {['guests', 'date', 'time', 'confirmation'].map((stepName, index) => {
            const status = flowSequenceHelpers.getStepIndicatorStatus(
              stepName as FlowStepId,
              step,
              reservationData
            );

            return (
              <motion.div
                key={stepName}
                className={`w-2 h-2 rounded-full transition-colors ${
                  status === 'completed' || status === 'active'
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: status === 'active' ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
                aria-label={`Paso ${index + 1}: ${flowSequenceHelpers.getStepTitle(stepName as FlowStepId)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Flow content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'guests' && (
            <GuestSelection
              key="guests"
              onNext={handleFlowNext}
              data={reservationData}
              heroCompatible={heroCompatible}
            />
          )}
          {step === 'date' && (
            <DateSelection
              key="date"
              onNext={handleFlowNext}
              data={reservationData}
              heroCompatible={heroCompatible}
            />
          )}
          {step === 'time' && (
            <TimeSelection
              key="time"
              onNext={handleFlowNext}
              data={reservationData}
              heroCompatible={heroCompatible}
            />
          )}
          {step === 'confirmation' && (
            <ConfirmationStep
              key="confirmation"
              data={reservationData}
              heroCompatible={heroCompatible}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// ============================================================================

/**
 * Guest Selection Step - Choose number of guests
 */
export const GuestSelection: React.FC<FlowStepProps> = ({ onNext, data, heroCompatible = false }) => {
  const maxGuests = 8;
  const guestNumbers = Array.from({ length: maxGuests }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
      role="region"
      aria-label="Selección de número de comensales"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        ¿Cuántas personas?
      </h3>

      <div className="grid grid-cols-4 gap-3 mb-6" role="radiogroup">
        {guestNumbers.map((num) => (
          <motion.button
            key={num}
            className={`w-12 h-12 rounded-full border-2 transition-colors ${
              data.guests === num
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 text-gray-700 hover:border-green-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNext({ guests: num })}
            role="radio"
            aria-checked={data.guests === num}
            aria-label={`${num} persona${num > 1 ? 's' : ''}`}
          >
            {num}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {data.guests > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Continuar con ${data.guests} persona${data.guests > 1 ? 's' : ''}`}
          >
            Siguiente →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// ============================================================================

/**
 * Date Selection Step - Choose reservation date
 */
export const DateSelection: React.FC<FlowStepProps> = ({ onNext, data, heroCompatible = false }) => {
  // Use hero-compatible helpers when heroCompatible=true
  const availableDates = heroCompatible
    ? heroCompatibleHelpers.getAvailableDates()
    : reservationDataHelpers.getAvailableDates().map(dateStr => new Date(dateStr));

  // Use appropriate formatDate function
  const formatDateFn = heroCompatible
    ? heroCompatibleHelpers.formatDate
    : reservationDataHelpers.formatDate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
      role="region"
      aria-label="Selección de fecha"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        ¿Qué día prefieres?
      </h3>

      <div className="space-y-3 mb-6" role="radiogroup">
        {availableDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = data.date === dateStr;
          const formattedDate = heroCompatible
            ? date.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })
            : formatDateFn(dateStr);

          return (
            <motion.button
              key={dateStr}
              className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                isSelected
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-green-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNext({ date: dateStr })}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Reservar para ${formattedDate}`}
            >
              <div className="font-medium">
                {formattedDate}
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {data.date && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Continuar con fecha ${formatDateFn(data.date)}`}
          >
            Siguiente →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// ============================================================================

/**
 * Time Selection Step - Choose reservation time
 */
export const TimeSelection: React.FC<FlowStepProps> = ({ onNext, data, heroCompatible = false }) => {
  // Use hero-compatible helpers when heroCompatible=true
  const availableTimes = heroCompatible
    ? heroCompatibleHelpers.getAvailableTimeSlots()
    : reservationDataHelpers.getAvailableTimeSlots();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
      role="region"
      aria-label="Selección de hora"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        ¿A qué hora?
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6" role="radiogroup">
        {availableTimes.map((time) => (
          <motion.button
            key={time}
            className={`p-4 rounded-xl border-2 transition-colors ${
              data.time === time
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'border-gray-300 text-gray-700 hover:border-green-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNext({ time })}
            role="radio"
            aria-checked={data.time === time}
            aria-label={`Reservar a las ${time}`}
          >
            <div className="font-medium text-lg">{time}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {data.time && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Confirmar reserva para las ${data.time}`}
          >
            Confirmar reserva →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// ============================================================================

/**
 * Confirmation Step - Show reservation summary
 */
export const ConfirmationStep: React.FC<{ data: ReservationData; heroCompatible?: boolean }> = ({ data, heroCompatible = false }) => {
  // Use hero-compatible helpers when heroCompatible=true
  const formattedDate = heroCompatible
    ? heroCompatibleHelpers.formatDate(data.date)
    : reservationDataHelpers.formatDate(data.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
      role="region"
      aria-label="Confirmación de reserva"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <span className="text-2xl" role="img" aria-label="Confirmado">✓</span>
        </motion.div>

        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          ¡Reserva confirmada!
        </h3>

        <motion.div
          className="bg-gray-50 rounded-xl p-4 text-left mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <strong>Personas:</strong> {data.guests}
            </div>
            <div>
              <strong>Fecha:</strong> {formattedDate}
            </div>
            <div>
              <strong>Hora:</strong> {data.time}
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Te hemos enviado la confirmación por WhatsApp
        </motion.p>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ============================================================================

export default FlowPanel;