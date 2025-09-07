/**
 * List Message Component
 * Simulates WhatsApp List Messages with expandable sections
 */

'use client';

import React, { useCallback,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { ChevronDown, List } from 'lucide-react';

import type { ListMessage, ListMessageOption } from '@/modules/marketing/domain/types/whatsapp-features.types';

interface ListMessageProps {
  listMessage: ListMessage;
  onOptionSelect?: (optionId: string) => void;
  isVisible?: boolean;
}

export function ListMessageComponent({
  listMessage,
  onOptionSelect,
  isVisible = true
}: ListMessageProps) {
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = useCallback((option: ListMessageOption) => {
    setSelectedOption(option.id);
    setIsListOpen(false);
    onOptionSelect?.(option.id);

    // Clear selection after animation
    setTimeout(() => {
      setSelectedOption(null);
    }, 2000);
  }, [onOptionSelect]);

  const handleOpenList = useCallback(() => {
    setIsListOpen(true);
  }, []);

  const handleCloseList = useCallback(() => {
    setIsListOpen(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* List Message Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        {listMessage.header && (
          <div className="px-3 pt-3 pb-1">
            <h4 className="font-semibold text-sm text-gray-900">
              {listMessage.header}
            </h4>
          </div>
        )}

        {/* Body */}
        <div className="px-3 py-2">
          <p className="text-sm text-gray-700 leading-relaxed">
            {listMessage.body}
          </p>
        </div>

        {/* Footer */}
        {listMessage.footer && (
          <div className="px-3 pb-2">
            <p className="text-xs text-gray-500 italic">
              {listMessage.footer}
            </p>
          </div>
        )}

        {/* List Button */}
        <div className="px-3 pb-3">
          <motion.button
            onClick={handleOpenList}
            className="w-full px-4 py-2.5 bg-white border-2 border-green-500 text-green-600 rounded-lg font-medium text-sm hover:bg-green-50 active:bg-green-100 transition-colors flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <List className="w-4 h-4" />
            {listMessage.buttonText}
            <ChevronDown className="w-4 h-4 ml-auto" />
          </motion.button>
        </div>

        {/* Selected Option Feedback */}
        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 pb-3"
            >
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Seleccionado: {
                    listMessage.sections
                      .flatMap(s => s.rows)
                      .find(r => r.id === selectedOption)?.title
                  }
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp Indicator */}
        <div className="px-3 pb-2">
          <span className="text-xs text-gray-400">Interactive List</span>
        </div>
      </motion.div>

      {/* List Modal */}
      <AnimatePresence>
        {isListOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
            onClick={handleCloseList}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-t-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {listMessage.buttonText}
                  </h3>
                  <button
                    onClick={handleCloseList}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="overflow-y-auto">
                {listMessage.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border-b border-gray-100 last:border-b-0">
                    {/* Section Title */}
                    {section.title && (
                      <div className="px-4 py-2 bg-gray-50">
                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          {section.title}
                        </h4>
                      </div>
                    )}

                    {/* Section Options */}
                    {section.rows.map((option, optionIndex) => (
                      <motion.button
                        key={option.id}
                        onClick={() => handleOptionSelect(option)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-b-0"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: sectionIndex * 0.1 + optionIndex * 0.05,
                          duration: 0.2
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {option.icon && (
                            <span className="text-2xl">{option.icon}</span>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {option.title}
                            </div>
                            {option.description && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {option.description}
                              </div>
                            )}
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}