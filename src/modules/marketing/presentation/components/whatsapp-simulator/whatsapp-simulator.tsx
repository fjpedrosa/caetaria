/**
 * WhatsApp Simulator Component
 * Main simulator that orchestrates all WhatsApp Business API features
 */

'use client';

import React, { useCallback, useEffect, useRef,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video} from 'lucide-react';

import type {
  ConversationScenario,
  WhatsAppMessage} from '@/modules/marketing/domain/types/whatsapp-features.types';

import { ListMessageComponent } from '../whatsapp-features/list-message';
import { MessageTemplateComponent } from '../whatsapp-features/message-template';
import { ProductCatalog } from '../whatsapp-features/product-catalog';
import { QuickReplyButtons } from '../whatsapp-features/quick-reply-buttons';
import { ShoppingCartComponent } from '../whatsapp-features/shopping-cart';
import { WhatsAppFlowComponent } from '../whatsapp-features/whatsapp-flow';

interface WhatsAppSimulatorProps {
  scenario: ConversationScenario;
  autoPlay?: boolean;
  speed?: number;
  onScenarioComplete?: () => void;
}

export function WhatsAppSimulator({
  scenario,
  autoPlay = true,
  speed = 1,
  onScenarioComplete
}: WhatsAppSimulatorProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive - only within the messages container
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Process next message in scenario
  const processNextMessage = useCallback(() => {
    if (currentMessageIndex >= scenario.messages.length) {
      onScenarioComplete?.();
      setIsPlaying(false);
      return;
    }

    const nextMessage = scenario.messages[currentMessageIndex];

    // Show typing indicator for incoming messages
    if (nextMessage.sender === 'bot') {
      setIsTyping(true);

      // Calculate typing duration based on message length
      const typingDuration = Math.min(
        Math.max(1000, nextMessage.content?.length ? nextMessage.content.length * 50 : 1500),
        3000
      ) / speed;

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          ...nextMessage,
          status: 'delivered',
          timestamp: new Date().getTime()
        }]);
        setCurrentMessageIndex(prev => prev + 1);

        // Mark as read after a short delay
        setTimeout(() => {
          setMessages(prev =>
            prev.map((msg, idx) =>
              idx === prev.length - 1
                ? { ...msg, status: 'read' }
                : msg
            )
          );
        }, 500 / speed);
      }, typingDuration);
    } else {
      // User messages appear immediately
      setMessages(prev => [...prev, {
        ...nextMessage,
        status: 'sent',
        timestamp: new Date().getTime()
      }]);
      setCurrentMessageIndex(prev => prev + 1);
    }
  }, [currentMessageIndex, scenario.messages, speed, onScenarioComplete]);

  // Auto-play messages
  useEffect(() => {
    if (!isPlaying) return;

    const delay = scenario.messages[currentMessageIndex - 1]?.delay || 2000;
    const timer = setTimeout(() => {
      processNextMessage();
    }, delay / speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentMessageIndex, processNextMessage, speed, scenario.messages]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render message status icon
  const renderStatus = (status?: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  // Render message content based on type
  const renderMessageContent = (message: WhatsAppMessage) => {
    switch (message.type) {
      case 'text':
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );

      case 'flow':
        return message.flow ? (
          <WhatsAppFlowComponent
            flow={message.flow}
            onSubmit={(data) => console.log('Flow submitted:', data)}
          />
        ) : null;

      case 'quick-reply':
        return message.quickReplyButtons ? (
          <QuickReplyButtons
            buttons={message.quickReplyButtons}
            onButtonClick={(id) => console.log('Button clicked:', id)}
          />
        ) : null;

      case 'catalog':
        return message.catalog ? (
          <ProductCatalog
            products={message.catalog}
            onAddToCart={(product, qty) => console.log('Added to cart:', product, qty)}
          />
        ) : null;

      case 'template':
        return message.template ? (
          <MessageTemplateComponent
            template={message.template}
            onButtonClick={(id) => console.log('Template button:', id)}
          />
        ) : null;

      case 'list':
        return message.listMessage ? (
          <ListMessageComponent
            listMessage={message.listMessage}
            onOptionSelect={(id) => console.log('List option:', id)}
          />
        ) : null;

      case 'cart':
        return message.cart ? (
          <ShoppingCartComponent
            cart={message.cart}
            onCheckout={() => console.log('Checkout initiated')}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        style={{ height: '700px' }}
      >
        {/* WhatsApp Header */}
        <div className="bg-green-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowLeft className="w-5 h-5 opacity-70" />
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {scenario.businessName.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-semibold">{scenario.businessName}</div>
                <div className="text-xs opacity-90">
                  {isTyping ? 'escribiendo...' : 'en línea'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Video className="w-5 h-5" />
              <Phone className="w-5 h-5" />
              <MoreVertical className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
          style={{
            height: 'calc(100% - 128px)',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d5dbb3\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundColor: '#e5ddd5',
            scrollBehavior: 'smooth'
          }}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.sender === 'customer' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`
                    max-w-[75%] rounded-lg p-2 shadow-sm
                    ${message.sender === 'customer'
                      ? 'bg-green-100 rounded-br-none'
                      : 'bg-white rounded-bl-none'
                    }
                  `}
                >
                  {renderMessageContent(message)}

                  {/* Timestamp and status */}
                  {message.type === 'text' && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {message.timestamp && formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'customer' && renderStatus(message.status)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="bg-white rounded-lg rounded-bl-none p-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-gray-100 p-3 flex items-center gap-2">
          <Smile className="w-6 h-6 text-gray-500" />
          <Paperclip className="w-6 h-6 text-gray-500" />
          <div className="flex-1 bg-white rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Escribe un mensaje"
              className="w-full outline-none text-sm"
              disabled
            />
          </div>
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            {messages.length === 0 || isTyping ? (
              <Mic className="w-5 h-5 text-white" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Playback Controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => {
            setMessages([]);
            setCurrentMessageIndex(0);
            setIsPlaying(true);
          }}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
        >
          Reiniciar
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          {isPlaying ? 'Pausar' : 'Reproducir'}
        </button>
      </div>
    </div>
  );
}