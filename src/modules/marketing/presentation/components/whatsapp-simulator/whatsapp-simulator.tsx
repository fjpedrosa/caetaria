/**
 * WhatsApp Simulator Component
 * Main simulator that showcases real WhatsApp Business API features
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Mic,
  ChevronLeft,
  Check,
  CheckCheck
} from 'lucide-react';

import type { 
  WhatsAppMessage,
  ConversationScenario,
  UseCaseScenarioType 
} from '@/modules/marketing/domain/types/whatsapp-features.types';

import {
  WhatsAppFlowComponent,
  QuickReplyButtons,
  ProductCatalog,
  MessageTemplateComponent,
  ListMessageComponent,
  ShoppingCartComponent
} from '../whatsapp-features';

interface WhatsAppSimulatorProps {
  scenario: ConversationScenario;
  isPlaying?: boolean;
  onComplete?: () => void;
}

export function WhatsAppSimulator({ 
  scenario, 
  isPlaying = true,
  onComplete 
}: WhatsAppSimulatorProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Play message sequence
  useEffect(() => {
    if (!isPlaying || currentMessageIndex >= scenario.messages.length) {
      if (currentMessageIndex >= scenario.messages.length && onComplete) {
        onComplete();
      }
      return;
    }

    const currentMessage = scenario.messages[currentMessageIndex];
    const delay = currentMessage.animation?.delay || 1500;

    // Show typing indicator for bot messages
    if (currentMessage.sender === 'bot') {
      setIsTyping(true);
      const typingDuration = Math.min(currentMessage.content?.length || 0, 100) * 20 + 500;
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { ...currentMessage, timestamp: Date.now() }]);
        setCurrentMessageIndex(prev => prev + 1);
        
        // Activate feature if present
        if (currentMessage.type !== 'text') {
          setActiveFeature(currentMessage.type);
        }
      }, typingDuration);
    } else {
      // Customer messages appear immediately
      setTimeout(() => {
        setMessages(prev => [...prev, { ...currentMessage, timestamp: Date.now() }]);
        setCurrentMessageIndex(prev => prev + 1);
      }, delay);
    }
  }, [currentMessageIndex, isPlaying, scenario.messages, onComplete]);

  // Reset when scenario changes
  useEffect(() => {
    setMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
    setActiveFeature(null);
  }, [scenario.id]);

  const handleFeatureInteraction = useCallback((featureType: string, data: any) => {
    console.log(`Feature interaction: ${featureType}`, data);
    // Here you can handle specific feature interactions
    // For demo purposes, we'll just close the feature after interaction
    setTimeout(() => {
      setActiveFeature(null);
    }, 1000);
  }, []);

  const renderMessage = (message: WhatsAppMessage) => {
    const isCustomer = message.sender === 'customer';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div className={`max-w-[80%] ${isCustomer ? 'order-2' : 'order-1'}`}>
          {/* Regular text message */}
          {message.type === 'text' && message.content && (
            <div 
              className={`px-3 py-2 rounded-2xl ${
                isCustomer 
                  ? 'bg-green-500 text-white rounded-br-sm' 
                  : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                isCustomer ? 'text-green-100' : 'text-gray-400'
              }`}>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {isCustomer && (
                  message.status === 'read' ? <CheckCheck className="w-3 h-3" /> :
                  message.status === 'delivered' ? <CheckCheck className="w-3 h-3 opacity-60" /> :
                  <Check className="w-3 h-3 opacity-60" />
                )}
              </div>
            </div>
          )}

          {/* Message Template */}
          {message.type === 'template' && message.template && (
            <MessageTemplateComponent
              template={message.template}
              onButtonClick={(buttonId) => handleFeatureInteraction('template-button', buttonId)}
              onCallToAction={() => handleFeatureInteraction('template-cta', null)}
            />
          )}

          {/* Quick Reply Buttons */}
          {message.type === 'quick-reply' && message.quickReplyButtons && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-3 py-2">
                <p className="text-sm text-gray-900">{message.content}</p>
              </div>
              <QuickReplyButtons
                buttons={message.quickReplyButtons}
                onButtonClick={(buttonId) => handleFeatureInteraction('quick-reply', buttonId)}
              />
            </div>
          )}

          {/* List Message */}
          {message.type === 'list' && message.listMessage && (
            <ListMessageComponent
              listMessage={message.listMessage}
              onOptionSelect={(optionId) => handleFeatureInteraction('list-option', optionId)}
            />
          )}

          {/* Product Catalog */}
          {message.type === 'catalog' && message.catalog && (
            <ProductCatalog
              products={message.catalog}
              onAddToCart={(product, quantity) => 
                handleFeatureInteraction('add-to-cart', { product, quantity })
              }
            />
          )}

          {/* Shopping Cart */}
          {message.type === 'cart' && message.cart && (
            <ShoppingCartComponent
              cart={message.cart}
              onCheckout={() => handleFeatureInteraction('checkout', null)}
            />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#e5ddd5]" ref={containerRef}>
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white p-3 flex items-center gap-3">
        <ChevronLeft className="w-6 h-6" />
        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
            {scenario.businessName.charAt(0)}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{scenario.businessName}</h3>
          <p className="text-xs opacity-80">
            {isTyping ? 'escribiendo...' : 'en línea'}
          </p>
        </div>
        <Phone className="w-5 h-5" />
        <Video className="w-5 h-5" />
        <MoreVertical className="w-5 h-5" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[url('/whatsapp-bg.png')] bg-repeat">
        {/* Date */}
        <div className="text-center mb-4">
          <span className="px-3 py-1 bg-white/80 rounded-full text-xs text-gray-600">
            Hoy
          </span>
        </div>

        {/* Messages */}
        {messages.map(renderMessage)}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start mb-2"
            >
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (visual only) */}
      <div className="bg-[#f0f0f0] p-2 flex items-center gap-2">
        <Paperclip className="w-6 h-6 text-gray-600" />
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center">
          <input
            type="text"
            placeholder="Escribe un mensaje"
            className="flex-1 text-sm outline-none"
            disabled
          />
        </div>
        <Mic className="w-6 h-6 text-gray-600" />
      </div>

      {/* WhatsApp Flow Overlay */}
      {activeFeature === 'flow' && messages[messages.length - 1]?.flow && (
        <WhatsAppFlowComponent
          flow={messages[messages.length - 1].flow!}
          isVisible={true}
          onSubmit={(data) => handleFeatureInteraction('flow-submit', data)}
          onClose={() => setActiveFeature(null)}
        />
      )}
    </div>
  );
}