'use client';

import { useEffect,useState } from 'react';
import { 
  Bot, 
  Check, 
  CheckCheck,
  MessageSquare, 
  Pause,
  Play,
  RotateCcw,
  Send, 
  User} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

const DEMO_CONVERSATION = [
  {
    type: 'user' as const,
    content: 'Hi, I need help with my recent order #12345',
    delay: 1000
  },
  {
    type: 'bot' as const,
    content: 'Hello! I\'d be happy to help you with your order. Let me look that up for you right away.',
    delay: 2000
  },
  {
    type: 'bot' as const,
    content: 'I found your order #12345. It was shipped yesterday and should arrive by tomorrow. Here\'s your tracking link: https://track.example.com/12345',
    delay: 3000
  },
  {
    type: 'user' as const,
    content: 'Perfect! Can you also help me change my delivery address?',
    delay: 4000
  },
  {
    type: 'bot' as const,
    content: 'I\'ll connect you with our delivery team to update your address. Please hold on for just a moment.',
    delay: 2000
  },
  {
    type: 'bot' as const,
    content: '🙋‍♀️ Sarah from our delivery team here! I can definitely help change your address. What\'s the new address you\'d like to use?',
    delay: 3000
  }
];

/**
 * WhatsApp Demo Widget - Client Component
 * 
 * Interactive demo showing WhatsApp conversation flow
 * with realistic typing indicators and message animations.
 */
export function WhatsAppDemoWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<'user' | 'bot' | null>(null);

  // Generate unique message ID
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Start demo
  const startDemo = () => {
    setIsPlaying(true);
    setCurrentMessageIndex(0);
    setMessages([]);
    playNextMessage(0);
  };

  // Reset demo
  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentMessageIndex(0);
    setMessages([]);
    setIsTyping(false);
    setTypingUser(null);
  };

  // Play next message in sequence
  const playNextMessage = (index: number) => {
    if (index >= DEMO_CONVERSATION.length) {
      setIsPlaying(false);
      setIsTyping(false);
      setTypingUser(null);
      return;
    }

    const demoMessage = DEMO_CONVERSATION[index];
    
    // Show typing indicator
    setIsTyping(true);
    setTypingUser(demoMessage.type);

    setTimeout(() => {
      // Add message
      const newMessage: Message = {
        id: generateMessageId(),
        type: demoMessage.type,
        content: demoMessage.content,
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      setTypingUser(null);

      // Update message status after a delay
      setTimeout(() => {
        if (demoMessage.type === 'bot') {
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          ));
          
          setTimeout(() => {
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
            ));
          }, 500);
        }
      }, 1000);

      // Play next message
      const nextIndex = index + 1;
      setCurrentMessageIndex(nextIndex);
      
      if (nextIndex < DEMO_CONVERSATION.length) {
        setTimeout(() => {
          playNextMessage(nextIndex);
        }, 1500);
      } else {
        setIsPlaying(false);
      }
    }, demoMessage.delay);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const renderMessageStatus = (message: Message) => {
    if (message.type === 'user') return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="text-white">
      {/* Section Header */}
      <div className="text-center mb-12">
        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 mb-6">
          📱 Interactive Demo
        </Badge>
        
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          See WhatsApp Cloud API
          <span className="block bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            in Action
          </span>
        </h2>
        
        <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8">
          Experience how our AI-powered platform handles real customer conversations 
          with intelligent routing and instant responses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* WhatsApp Interface Mock */}
        <div className="relative max-w-md mx-auto">
          {/* iPhone Frame */}
          <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl mx-auto" style={{ width: '320px', height: '640px' }}>
            {/* iPhone Notch */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>
            
            {/* iPhone Screen */}
            <div className="bg-white rounded-[2.5rem] w-full h-full overflow-hidden relative">
              <Card className="bg-white rounded-[2.5rem] overflow-hidden shadow-none border-0 w-full h-full">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Your Business</div>
                  <div className="text-sm text-green-100 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto bg-[#e5ddd5] p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative ${
                    message.type === 'user'
                      ? 'bg-green-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  }`}>
                    {/* Message Icon */}
                    <div className={`absolute -top-2 ${
                      message.type === 'user' ? '-right-2' : '-left-2'
                    } w-6 h-6 rounded-full flex items-center justify-center ${
                      message.type === 'user' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-white" />
                      )}
                    </div>
                    
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    <div className={`flex items-center justify-end mt-2 space-x-1 text-xs ${
                      message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {renderMessageStatus(message)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && typingUser && (
                <div className={`flex ${typingUser === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`px-4 py-3 rounded-lg ${
                    typingUser === 'user'
                      ? 'bg-green-500/20 border border-green-300'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                  <span className="text-gray-500 text-sm">
                    {isPlaying ? 'Demo in progress...' : 'Type a message...'}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 p-0"
                  disabled={isPlaying}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Controls and Information */}
        <div className="space-y-8">
          {/* Demo Controls */}
          <Card className="p-8 bg-white/10 backdrop-blur-sm border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Demo Controls</h3>
            
            <div className="flex space-x-4 mb-6">
              <Button
                onClick={startDemo}
                disabled={isPlaying}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{isPlaying ? 'Playing...' : 'Start Demo'}</span>
              </Button>
              
              <Button
                onClick={resetDemo}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="text-sm text-green-100">
              <p className="mb-2">
                🎬 This demo shows a realistic customer service conversation with:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Instant AI responses</li>
                <li>Seamless human handoff</li>
                <li>Order tracking integration</li>
                <li>Real-time message status</li>
              </ul>
            </div>
          </Card>

          {/* Key Features */}
          <Card className="p-8 bg-white/10 backdrop-blur-sm border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">What You're Seeing</h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">AI-Powered Responses</h4>
                  <p className="text-green-100 text-sm">
                    Intelligent chatbot handles common queries instantly with contextual understanding.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Human Handoff</h4>
                  <p className="text-green-100 text-sm">
                    Seamless transition to human agents when complex issues need personal attention.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Message Tracking</h4>
                  <p className="text-green-100 text-sm">
                    Real-time delivery status and read receipts for complete visibility.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}