'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { phoneNumberSchema, type PhoneNumberFormData } from '../../domain/schemas'
import type { StepProps } from '../../domain/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Phone, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const countryCodes = [
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+1', country: 'USA', flag: '🇺🇸' }
]

export function StepPhoneConnect({ onNext, onPrev, defaultValues }: StepProps) {
  const [selectedCountry, setSelectedCountry] = useState(
    countryCodes.find(c => c.code === defaultValues?.countryCode) || countryCodes[0]
  )
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PhoneNumberFormData>({
    resolver: zodResolver(phoneNumberSchema),
    defaultValues: {
      ...defaultValues,
      countryCode: selectedCountry.code
    }
  })

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    
    if (selectedCountry.code === '+34') {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/)
      if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`
      }
    } else if (selectedCountry.code === '+52') {
      const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/)
      if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`
      }
    }
    
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`
    }
    
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    e.target.value = formatted
  }

  const onSubmit = async (data: PhoneNumberFormData) => {
    const fullNumber = `${selectedCountry.code}${data.phoneNumber.replace(/\s/g, '')}`
    await onNext({
      ...data,
      phoneNumber: fullNumber,
      countryCode: selectedCountry.code
    })
  }

  const isWhatsAppBusiness = watch('isWhatsAppBusiness')

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 mb-4">
          <Phone className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Conecta tu número de WhatsApp</h2>
        <p className="text-gray-600">
          Vincularemos tu número para comenzar a automatizar tus conversaciones
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="countryCode">País</Label>
          <div className="grid grid-cols-3 gap-2">
            {countryCodes.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  setSelectedCountry(country)
                  setValue('countryCode', country.code)
                }}
                className={cn(
                  'flex items-center justify-center gap-2 p-2 rounded-md border transition-colors',
                  selectedCountry.code === country.code
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm font-medium">{country.code}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Número de teléfono *</Label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 bg-gray-100 rounded-md border border-gray-200">
              <span className="text-lg mr-2">{selectedCountry.flag}</span>
              <span className="font-medium">{selectedCountry.code}</span>
            </div>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="600 123 456"
              {...register('phoneNumber')}
              onChange={handlePhoneChange}
              className={cn('flex-1', errors.phoneNumber && 'border-red-500')}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
          )}
          
          <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Importante:</p>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Asegúrate de que el número tenga WhatsApp activo</li>
                <li>Recibirás un código de verificación por WhatsApp</li>
                <li>El número debe ser de tu propiedad o tener autorización</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="isWhatsAppBusiness"
              checked={isWhatsAppBusiness}
              onCheckedChange={(checked) => setValue('isWhatsAppBusiness', checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="isWhatsAppBusiness" className="cursor-pointer">
                Ya tengo WhatsApp Business
              </Label>
              <p className="text-sm text-gray-500">
                Si ya usas WhatsApp Business, podemos importar tu configuración actual
              </p>
            </div>
          </div>
          
          {isWhatsAppBusiness && (
            <div className="ml-7 p-3 bg-green-50 rounded-md flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">¡Excelente!</p>
                <p>Podremos migrar tu catálogo, etiquetas y mensajes rápidos actuales.</p>
              </div>
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
            {isSubmitting ? 'Verificando...' : 'Continuar'}
          </Button>
        </div>
      </form>
    </div>
  )
}