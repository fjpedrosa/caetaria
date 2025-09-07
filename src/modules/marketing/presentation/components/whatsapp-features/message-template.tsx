/**
 * Message Template Component
 * Simulates WhatsApp Business Message Templates with media and buttons
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Phone, Play } from 'lucide-react';

import type { MessageTemplate } from '@/modules/marketing/domain/types/whatsapp-features.types';

import { QuickReplyButtons } from './quick-reply-buttons';

interface MessageTemplateProps {
  template: MessageTemplate;
  onButtonClick?: (buttonId: string) => void;
  onCallToAction?: () => void;
  isVisible?: boolean;
}

export function MessageTemplateComponent({
  template,
  onButtonClick,
  onCallToAction,
  isVisible = true
}: MessageTemplateProps) {
  if (!isVisible) {
    return null;
  }

  const renderHeader = () => {
    if (!template.header) return null;

    switch (template.header.type) {
      case 'text':
        return (
          <div className="font-semibold text-gray-900 text-sm mb-2">
            {template.header.content}
          </div>
        );

      case 'image':
        return (
          <div className="mb-3 -mx-3 -mt-3">
            <img
              src={template.header.content}
              alt="Template header"
              className="w-full h-40 object-cover rounded-t-lg"
            />
          </div>
        );

      case 'video':
        return (
          <div className="mb-3 -mx-3 -mt-3 relative">
            <div className="w-full h-40 bg-black rounded-t-lg flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-900 ml-1" />
                </div>
              </div>
              <video
                src={template.header.content}
                className="w-full h-full object-cover rounded-t-lg opacity-80"
                poster={template.header.content}
              />
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Documento</div>
              <div className="text-xs text-gray-500">{template.header.content}</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTemplateIcon = () => {
    switch (template.type) {
      case 'marketing':
        return '📢';
      case 'utility':
        return '🔧';
      case 'authentication':
        return '🔐';
      default:
        return '📄';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Template Type Badge */}
      <div className="px-3 pt-3 pb-1">
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
          <span className="text-xs">{getTemplateIcon()}</span>
          <span className="text-xs font-medium text-gray-600 capitalize">
            {template.type} Template
          </span>
        </div>
      </div>

      <div className="p-3 pt-2">
        {/* Header */}
        {renderHeader()}

        {/* Body */}
        <div className="text-gray-900 text-sm whitespace-pre-wrap leading-relaxed">
          {template.body}
        </div>

        {/* Footer */}
        {template.footer && (
          <div className="mt-2 text-xs text-gray-500 italic">
            {template.footer}
          </div>
        )}

        {/* Call to Action Buttons */}
        {template.callToAction && (
          <motion.button
            onClick={onCallToAction}
            className="mt-3 w-full px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 active:bg-green-700 transition-colors flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            {template.callToAction.type === 'phone' ? (
              <Phone className="w-4 h-4" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            {template.callToAction.text}
          </motion.button>
        )}
      </div>

      {/* Quick Reply Buttons */}
      {template.buttons && template.buttons.length > 0 && (
        <div className="border-t border-gray-100">
          <QuickReplyButtons
            buttons={template.buttons}
            onButtonClick={onButtonClick}
          />
        </div>
      )}

      {/* WhatsApp Template Indicator */}
      <div className="px-3 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Business Message</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Verified</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}