'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { autoMessageSchema, type AutoMessageFormData } from '../../domain/schemas'
import type { StepProps } from '../../domain/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Clock, Sparkles, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const messageTemplates = [
  {
    id: 'friendly',
    name: 'Amigable',
    template: '¡Hola! 👋 Bienvenido/a a {businessName}. ¿En qué puedo ayudarte hoy?\n\nPuedes preguntarme sobre:\n• Nuestros productos/servicios\n• Horarios de atención\n• Precios y promociones\n• Hacer una reserva/pedido\n\n¿Por dónde comenzamos? 😊'
  },
  {
    id: 'professional',
    name: 'Profesional',
    template: 'Bienvenido/a a {businessName}.\n\nGracias por contactarnos. Estamos aquí para ayudarte con:\n• Información de productos y servicios\n• Consultas y presupuestos\n• Soporte técnico\n• Programación de citas\n\n¿En qué podemos asistirte?'
  },
  {
    id: 'sales',
    name: 'Ventas',
    template: '¡Hola! 🎉 ¡Qué bueno que nos escribes!\n\nEn {businessName} tenemos ofertas especiales para ti:\n• 20% de descuento en tu primera compra\n• Envío gratis en pedidos superiores a 50€\n• Programa de puntos y recompensas\n\n¿Te gustaría conocer nuestro catálogo? Escribe "CATÁLOGO" para recibir nuestros productos destacados.'
  }
]

const responseTimeOptions = [
  { value: 'instant', label: 'Instantánea', description: 'Respuesta inmediata' },
  { value: '1min', label: '1 minuto', description: 'Responde en 1 minuto' },
  { value: '5min', label: '5 minutos', description: 'Responde en 5 minutos' },
  { value: '15min', label: '15 minutos', description: 'Responde en 15 minutos' },
  { value: 'custom', label: 'Personalizado', description: 'Define tu tiempo' }
]

export function StepAutoMessage({ onNext, onPrev, defaultValues }: StepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('friendly')
  const [keywords, setKeywords] = useState<string[]>(defaultValues?.keywords || [])
  const [keywordInput, setKeywordInput] = useState('')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AutoMessageFormData>({
    resolver: zodResolver(autoMessageSchema),
    defaultValues: {
      welcomeMessage: defaultValues?.welcomeMessage || messageTemplates[0].template,
      responseTime: defaultValues?.responseTime || 'instant',
      enableKeywords: defaultValues?.enableKeywords ?? true,
      keywords: keywords
    }
  })

  const welcomeMessage = watch('welcomeMessage')
  const responseTime = watch('responseTime')
  const enableKeywords = watch('enableKeywords')

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      const businessName = localStorage.getItem('onboarding_businessName') || 'Tu Negocio'
      setValue('welcomeMessage', template.template.replace('{businessName}', businessName))
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()]
      setKeywords(newKeywords)
      setValue('keywords', newKeywords)
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword)
    setKeywords(newKeywords)
    setValue('keywords', newKeywords)
  }

  const onSubmit = async (data: AutoMessageFormData) => {
    await onNext({
      ...data,
      keywords: enableKeywords ? keywords : undefined
    })
  }

  const charCount = welcomeMessage?.length || 0
  const charLimit = 1000

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-purple-100 text-purple-600 mb-4">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Crea tu primer mensaje automático</h2>
        <p className="text-gray-600">
          Configura el mensaje de bienvenida que recibirán tus clientes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-3">
          <Label>Plantillas rápidas</Label>
          <div className="grid grid-cols-3 gap-2">
            {messageTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template.id)}
                className={cn(
                  'p-3 rounded-md border text-sm font-medium transition-colors',
                  selectedTemplate === template.id
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="welcomeMessage">Mensaje de bienvenida *</Label>
            <span className={cn(
              'text-sm',
              charCount > charLimit ? 'text-red-500' : 'text-gray-500'
            )}>
              {charCount}/{charLimit}
            </span>
          </div>
          <Textarea
            id="welcomeMessage"
            rows={8}
            placeholder="Escribe tu mensaje de bienvenida..."
            {...register('welcomeMessage')}
            className={errors.welcomeMessage ? 'border-red-500' : ''}
          />
          {errors.welcomeMessage && (
            <p className="text-sm text-red-500">{errors.welcomeMessage.message}</p>
          )}
          
          <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-md">
            <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Tip: Usa emojis y un tono amigable para hacer tu mensaje más atractivo
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responseTime" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tiempo de respuesta
          </Label>
          <Select
            value={responseTime}
            onValueChange={(value) => setValue('responseTime', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {responseTimeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="enableKeywords">Palabras clave automáticas</Label>
            <Switch
              id="enableKeywords"
              checked={enableKeywords}
              onCheckedChange={(checked) => setValue('enableKeywords', checked)}
            />
          </div>
          
          {enableKeywords && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Configura palabras clave que activarán respuestas automáticas
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Ej: precio, horario, catálogo..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addKeyword}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="px-2 py-1 flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onPrev}
            className="flex-1"
          >
            Anterior
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Continuar'}
          </Button>
        </div>
      </form>
    </div>
  )
}