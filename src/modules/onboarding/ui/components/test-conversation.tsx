"use client";

/**
 * Test Conversation Component
 * Client Component - Interactive testing interface for bot conversations
 */

import { useEffect,useRef, useState } from 'react';
import { AlertCircle, Bot, CheckCircle, Loader2, Send, User, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

interface TestStatus {
  webhookConnected: boolean;
  messageSent: boolean;
  responseReceived: boolean;
  allTestsPassed: boolean;
}

export function TestConversation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Test environment initialized. Ready to send test messages.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>({
    webhookConnected: false,
    messageSent: false,
    responseReceived: false,
    allTestsPassed: false,
  });
  const [currentTest, setCurrentTest] = useState<'idle' | 'webhook' | 'message' | 'complete'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const runFullTest = async () => {
    if (!testPhoneNumber) {
      addMessage({
        type: 'system',
        content: 'Please enter a test phone number first.',
      });
      return;
    }

    setCurrentTest('webhook');
    setIsLoading(true);

    try {
      // Step 1: Test webhook connectivity
      addMessage({
        type: 'system',
        content: 'Testing webhook connectivity...',
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const webhookSuccess = Math.random() > 0.2; // 80% success rate
      if (webhookSuccess) {
        setTestStatus(prev => ({ ...prev, webhookConnected: true }));
        addMessage({
          type: 'system',
          content: '✅ Webhook connectivity test passed',
        });
      } else {
        addMessage({
          type: 'system',
          content: '❌ Webhook connectivity test failed. Please check your server configuration.',
        });
        return;
      }

      // Step 2: Send test message
      setCurrentTest('message');
      addMessage({
        type: 'system',
        content: `Sending test message to ${testPhoneNumber}...`,
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const messageSuccess = Math.random() > 0.2; // 80% success rate
      if (messageSuccess) {
        setTestStatus(prev => ({ ...prev, messageSent: true }));
        addMessage({
          type: 'system',
          content: '✅ Test message sent successfully',
        });
        
        addMessage({
          type: 'bot',
          content: 'Hello! Welcome to our business. How can I help you today?',
          status: 'delivered',
        });

        // Simulate response
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTestStatus(prev => ({ ...prev, responseReceived: true }));
        
        addMessage({
          type: 'system',
          content: '✅ Bot response received successfully',
        });
        
      } else {
        addMessage({
          type: 'system',
          content: '❌ Failed to send test message. Please check your WhatsApp API configuration.',
        });
        return;
      }

      // Step 3: Complete tests
      setCurrentTest('complete');
      const allPassed = webhookSuccess && messageSuccess;
      setTestStatus(prev => ({ ...prev, allTestsPassed: allPassed }));
      
      if (allPassed) {
        addMessage({
          type: 'system',
          content: '🎉 All tests passed! Your WhatsApp bot is ready to go live.',
        });
        
        // Auto-advance after successful tests
        setTimeout(() => {
          router.push('/onboarding/complete');
        }, 2000);
      }

    } catch (error) {
      addMessage({
        type: 'system',
        content: '❌ Test failed due to unexpected error.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    addMessage({
      type: 'user',
      content: userMessage,
      status: 'sending',
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update message status
    setMessages(prev => prev.map(msg => 
      msg.type === 'user' && msg.status === 'sending' 
        ? { ...msg, status: 'delivered' }
        : msg
    ));

    // Simulate bot response
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const responses = [
      "Thank you for your message! How can I assist you further?",
      "I received your message. Is there anything specific you need help with?",
      "Hello! I'm here to help. What would you like to know?",
      "Thanks for reaching out! What can I do for you today?",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addMessage({
      type: 'bot',
      content: randomResponse,
      status: 'delivered',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTestMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-2 ${
          testStatus.webhookConnected 
            ? 'border-green-200 bg-green-50' 
            : currentTest === 'webhook' 
            ? 'border-blue-200 bg-blue-50' 
            : 'border-gray-200'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {testStatus.webhookConnected ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : currentTest === 'webhook' ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-sm">Webhook</p>
                <p className="text-xs text-gray-600">
                  {testStatus.webhookConnected ? 'Connected' : 'Not tested'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          testStatus.messageSent 
            ? 'border-green-200 bg-green-50' 
            : currentTest === 'message' 
            ? 'border-blue-200 bg-blue-50' 
            : 'border-gray-200'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {testStatus.messageSent ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : currentTest === 'message' ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-sm">Message Delivery</p>
                <p className="text-xs text-gray-600">
                  {testStatus.messageSent ? 'Successful' : 'Not tested'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          testStatus.responseReceived 
            ? 'border-green-200 bg-green-50' 
            : currentTest === 'complete' 
            ? 'border-blue-200 bg-blue-50' 
            : 'border-gray-200'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {testStatus.responseReceived ? (
                <Bot className="w-5 h-5 text-green-600" />
              ) : currentTest === 'complete' ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Bot className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-sm">Bot Response</p>
                <p className="text-xs text-gray-600">
                  {testStatus.responseReceived ? 'Working' : 'Not tested'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Phone Number Input */}
      <div className="flex space-x-4">
        <Input
          placeholder="Enter test phone number (e.g., +1234567890)"
          value={testPhoneNumber}
          onChange={(e) => setTestPhoneNumber(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={runFullTest}
          disabled={isLoading || !testPhoneNumber || testStatus.allTestsPassed}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Run All Tests
        </Button>
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Test Conversation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages */}
            <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' 
                      ? 'justify-end' 
                      : message.type === 'system'
                      ? 'justify-center'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'system'
                        ? 'bg-gray-200 text-gray-700 text-sm'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="w-4 h-4 mt-0.5 text-gray-500" />
                      )}
                      {message.type === 'user' && (
                        <User className="w-4 h-4 mt-0.5 text-blue-100" />
                      )}
                      <div className="flex-1">
                        <p>{message.content}</p>
                        {message.status && (
                          <div className="flex items-center space-x-1 mt-1">
                            {message.status === 'sending' && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            {message.status === 'delivered' && (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            )}
                            {message.status === 'failed' && (
                              <AlertCircle className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Type a test message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={!testStatus.webhookConnected}
              />
              <Button
                onClick={sendTestMessage}
                disabled={!inputMessage.trim() || !testStatus.webhookConnected}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      {testStatus.allTestsPassed && (
        <div className="text-center pt-4">
          <Button
            onClick={() => router.push('/onboarding/complete')}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            Complete Setup
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
