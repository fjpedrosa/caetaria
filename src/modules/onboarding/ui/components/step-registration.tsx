'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, type RegistrationFormData } from '../../domain/schemas'
import type { StepProps } from '../../domain/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Chrome,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function StepRegistration({ onNext, onPrev, defaultValues }: StepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      ...defaultValues,
      acceptTerms: false,
      acceptPrivacy: false,
      receiveUpdates: false
    }
  })

  const password = watch('password')
  const acceptTerms = watch('acceptTerms')
  const acceptPrivacy = watch('acceptPrivacy')

  const handleGoogleAuth = async () => {
    setAuthMethod('google')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    await onNext({
      authMethod: 'google',
      googleToken: 'fake_google_token_123'
    })
  }

  const onSubmit = async (data: RegistrationFormData) => {
    await onNext({
      ...data,
      authMethod: 'email'
    })
  }

  const passwordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    const levels = [
      { level: 0, text: '', color: '' },
      { level: 1, text: 'Muy débil', color: 'bg-red-500' },
      { level: 2, text: 'Débil', color: 'bg-orange-500' },
      { level: 3, text: 'Media', color: 'bg-yellow-500' },
      { level: 4, text: 'Fuerte', color: 'bg-green-500' },
      { level: 5, text: 'Muy fuerte', color: 'bg-green-600' }
    ]
    
    return levels[strength]
  }

  const strength = passwordStrength()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
          <User className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Crea tu cuenta</h2>
        <p className="text-gray-600">
          Último paso para comenzar tu prueba gratuita de 14 días
        </p>
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGoogleAuth}
          disabled={isSubmitting}
        >
          <Chrome className="h-5 w-5 mr-2" />
          Continuar con Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">O regístrate con email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Contraseña *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
                className={cn('pr-10', errors.password && 'border-red-500')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'h-1 flex-1 rounded-full bg-gray-200 transition-colors',
                        level <= strength.level && strength.color
                      )}
                    />
                  ))}
                </div>
                {strength.text && (
                  <p className="text-xs text-gray-600">
                    Seguridad: <span className="font-medium">{strength.text}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                {...register('confirmPassword')}
                className={cn('pr-10', errors.confirmPassword && 'border-red-500')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                className={errors.acceptTerms ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <Label htmlFor="acceptTerms" className="cursor-pointer text-sm">
                  Acepto los{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    términos y condiciones
                  </a>{' '}
                  *
                </Label>
                {errors.acceptTerms && (
                  <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptPrivacy"
                checked={acceptPrivacy}
                onCheckedChange={(checked) => setValue('acceptPrivacy', checked as boolean)}
                className={errors.acceptPrivacy ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <Label htmlFor="acceptPrivacy" className="cursor-pointer text-sm">
                  Acepto la{' '}
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    política de privacidad
                  </a>{' '}
                  *
                </Label>
                {errors.acceptPrivacy && (
                  <p className="text-xs text-red-500">{errors.acceptPrivacy.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="receiveUpdates"
                {...register('receiveUpdates')}
              />
              <Label htmlFor="receiveUpdates" className="cursor-pointer text-sm">
                Quiero recibir novedades y ofertas especiales
              </Label>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Tu información está segura</p>
              <p>Utilizamos encriptación de nivel bancario y nunca compartimos tus datos.</p>
            </div>
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
              disabled={isSubmitting || authMethod === 'google'}
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}