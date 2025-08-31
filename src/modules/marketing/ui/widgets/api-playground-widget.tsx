'use client';

import { useState } from 'react';
import {
  Check,
  Code,
  Copy,
  FileText,
  Image,
  MessageSquare,
  Paperclip,
  Play,
  Terminal,
  Zap} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApiExample {
  id: string;
  title: string;
  description: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  code: string;
  response: string;
}

const API_EXAMPLES: ApiExample[] = [
  {
    id: 'send-text',
    title: 'Send Text Message',
    description: 'Send a simple text message to a WhatsApp user',
    method: 'POST',
    endpoint: '/v1/messages',
    code: `{
  "messaging_product": "whatsapp",
  "to": "+1234567890",
  "type": "text",
  "text": {
    "body": "Hello! Welcome to our service. How can I help you today?"
  }
}`,
    response: `{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "+1234567890",
    "wa_id": "1234567890"
  }],
  "messages": [{
    "id": "wamid.HBgLMTIzNDU2Nzg5MABCAAIYEFtLR3VRN2pGNjdFV0ljBTU0",
    "message_status": "accepted"
  }]
}`
  },
  {
    id: 'send-template',
    title: 'Send Template Message',
    description: 'Send a pre-approved template message for notifications',
    method: 'POST',
    endpoint: '/v1/messages',
    code: `{
  "messaging_product": "whatsapp",
  "to": "+1234567890",
  "type": "template",
  "template": {
    "name": "order_confirmation",
    "language": {
      "code": "en_US"
    },
    "components": [{
      "type": "body",
      "parameters": [{
        "type": "text",
        "text": "John Doe"
      }, {
        "type": "text",
        "text": "#12345"
      }]
    }]
  }
}`,
    response: `{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "+1234567890",
    "wa_id": "1234567890"
  }],
  "messages": [{
    "id": "wamid.HBgLMTIzNDU2Nzg5MABCAAIYEFtLR3VRN2pGNjdFV0ljBTU0",
    "message_status": "accepted"
  }]
}`
  },
  {
    id: 'send-media',
    title: 'Send Media Message',
    description: 'Send images, documents, or other media files',
    method: 'POST',
    endpoint: '/v1/messages',
    code: `{
  "messaging_product": "whatsapp",
  "to": "+1234567890",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "Check out our latest product!"
  }
}`,
    response: `{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "+1234567890",
    "wa_id": "1234567890"
  }],
  "messages": [{
    "id": "wamid.HBgLMTIzNDU2Nzg5MABCAAIYEFtLR3VRN2pGNjdFV0ljBTU0",
    "message_status": "accepted"
  }]
}`
  },
  {
    id: 'webhook-receive',
    title: 'Receive Messages',
    description: 'Handle incoming messages via webhook',
    method: 'POST',
    endpoint: '/webhook',
    code: `// Incoming webhook payload
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "+15550123456",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "messages": [{
          "from": "1234567890",
          "id": "wamid.HBgLMTIzNDU2Nzg5MABCAAIYEFtLR3VRN2pGNjdFV0ljBTU0",
          "timestamp": "1688072400",
          "text": {
            "body": "Hello, I need help with my order"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}`,
    response: `// Response from your webhook
{
  "status": "success",
  "message": "Message processed successfully"
}`
  }
];

/**
 * API Playground Widget - Client Component
 *
 * Interactive API explorer with live code examples,
 * customizable parameters, and response previews.
 */
export function ApiPlaygroundWidget() {
  const [selectedExample, setSelectedExample] = useState<ApiExample>(API_EXAMPLES[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [message, setMessage] = useState('Hello! Welcome to our service. How can I help you today?');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const handleCopy = async (content: string, key: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates({ ...copiedStates, [key]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const executeExample = async () => {
    setIsExecuting(true);

    // Simulate API call delay
    setTimeout(() => {
      setExecutionResult(selectedExample.response);
      setIsExecuting(false);
    }, 1500);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'POST': return 'bg-green-500';
      case 'GET': return 'bg-blue-500';
      case 'PUT': return 'bg-orange-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getExampleIcon = (id: string) => {
    switch (id) {
      case 'send-text': return MessageSquare;
      case 'send-template': return FileText;
      case 'send-media': return Image;
      case 'webhook-receive': return Terminal;
      default: return Code;
    }
  };

  return (
    <div className="text-white">
      {/* Section Header */}
      <div className="text-center mb-12">
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2 mb-6">
          ⚡ Prueba en Vivo
        </Badge>

        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Prueba WhatsApp
          <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Automático Ahora
          </span>
        </h2>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Ve cómo funciona nuestro WhatsApp automático.
          Prueba enviar mensajes y recibir respuestas en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Examples Sidebar */}
        <div className="xl:col-span-1">
          <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-yellow-400" />
              Ejemplos en Vivo
            </h3>

            <div className="space-y-3">
              {API_EXAMPLES.map((example) => {
                const IconComponent = getExampleIcon(example.id);
                return (
                  <button
                    key={example.id}
                    onClick={() => setSelectedExample(example)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      selectedExample.id === example.id
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className={`w-5 h-5 ${
                        selectedExample.id === example.id ? 'text-yellow-400' : 'text-gray-400'
                      }`} />
                      <div className={`text-xs font-mono px-2 py-1 rounded ${
                        getMethodColor(example.method)
                      } text-white`}>
                        {example.method}
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-1">{example.title}</h4>
                    <p className="text-sm text-gray-400">{example.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Quick Customization */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="font-semibold text-white mb-4">Personaliza tu Prueba</h4>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Número de WhatsApp</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="+1234567890"
                  />
                </div>

                {selectedExample.id === 'send-text' && (
                  <div>
                    <Label className="text-gray-300 text-sm mb-2 block">Mensaje</Label>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Your message..."
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="xl:col-span-2">
          <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-bold text-white">{selectedExample.title}</h3>
                <div className={`text-xs font-mono px-3 py-1 rounded ${
                  getMethodColor(selectedExample.method)
                } text-white`}>
                  {selectedExample.method}
                </div>
              </div>

              <Button
                onClick={executeExample}
                disabled={isExecuting}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                {isExecuting ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Try It
                  </>
                )}
              </Button>
            </div>

            <p className="text-gray-300 mb-6">{selectedExample.description}</p>

            {/* Endpoint */}
            <div className="mb-6">
              <Label className="text-gray-300 text-sm mb-2 block">Conexión WhatsApp</Label>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-700 px-3 py-2 rounded-l-lg font-mono text-sm text-white border border-gray-600">
                  Tu WhatsApp conectado
                </div>
                <div className="bg-gray-900 px-3 py-2 rounded-r-lg font-mono text-sm text-yellow-400 border border-gray-600 border-l-0 flex-1">
                  Listo para enviar
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy('Tu WhatsApp está listo para enviar mensajes automáticos', 'endpoint')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {copiedStates['endpoint'] ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Code and Response Tabs */}
            <Tabs defaultValue="request" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="request" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                  Mensaje que Envías
                </TabsTrigger>
                <TabsTrigger value="response" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                  Respuesta Automática
                </TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="mt-4">
                <div className="relative">
                  <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-100 overflow-x-auto border border-gray-600">
                    <code>{selectedExample.code}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(selectedExample.code, 'request')}
                    className="absolute top-2 right-2 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {copiedStates['request'] ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="response" className="mt-4">
                <div className="relative">
                  {executionResult ? (
                    <pre className="bg-gray-900 p-4 rounded-lg text-sm text-green-400 overflow-x-auto border border-gray-600 animate-fade-in">
                      <code>{executionResult}</code>
                    </pre>
                  ) : (
                    <div className="bg-gray-900 p-4 rounded-lg text-sm text-gray-500 border border-gray-600 text-center">
                      Haz clic en "Probarlo" para ver la respuesta automática
                    </div>
                  )}

                  {executionResult && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(executionResult, 'response')}
                      className="absolute top-2 right-2 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      {copiedStates['response'] ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Documentation Link */}
            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-gray-400 mb-4">
                ¿Quieres ver más ejemplos de cómo funciona?
              </p>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Más Ejemplos
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}