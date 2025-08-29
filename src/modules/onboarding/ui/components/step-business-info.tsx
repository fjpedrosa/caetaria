'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessInfoSchema, type BusinessInfoFormData } from '../../domain/schemas'
import type { StepProps } from '../../domain/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Users, TrendingUp } from 'lucide-react'

const sectorLabels: Record<string, string> = {
  retail: 'Comercio / Retail',
  services: 'Servicios profesionales',
  restaurant: 'Restaurante / Alimentación',
  health: 'Salud y bienestar',
  education: 'Educación',
  technology: 'Tecnología',
  'real-estate': 'Inmobiliaria',
  automotive: 'Automotriz',
  beauty: 'Belleza y estética',
  fitness: 'Fitness y deportes',
  other: 'Otro'
}

const employeeOptions = [
  { value: '1', label: 'Solo yo' },
  { value: '2-5', label: '2-5 empleados' },
  { value: '6-10', label: '6-10 empleados' },
  { value: '11-25', label: '11-25 empleados' },
  { value: '26-50', label: '26-50 empleados' },
  { value: '50+', label: 'Más de 50 empleados' }
]

const clientOptions = [
  { value: '0-50', label: 'Menos de 50' },
  { value: '51-200', label: '51-200 clientes' },
  { value: '201-500', label: '201-500 clientes' },
  { value: '501-1000', label: '501-1,000 clientes' },
  { value: '1001-5000', label: '1,001-5,000 clientes' },
  { value: '5000+', label: 'Más de 5,000 clientes' }
]

export function StepBusinessInfo({ onNext, defaultValues }: StepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues
  })

  const onSubmit = async (data: BusinessInfoFormData) => {
    await onNext(data)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Cuéntanos sobre tu negocio</h2>
        <p className="text-gray-600">
          Esta información nos ayudará a personalizar tu experiencia
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="businessName">Nombre del negocio *</Label>
          <Input
            id="businessName"
            placeholder="Ej: Restaurante El Buen Sabor"
            {...register('businessName')}
            className={errors.businessName ? 'border-red-500' : ''}
          />
          {errors.businessName && (
            <p className="text-sm text-red-500">{errors.businessName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector">Sector / Industria *</Label>
          <Select
            value={watch('sector')}
            onValueChange={(value) => setValue('sector', value as any)}
          >
            <SelectTrigger className={errors.sector ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona tu sector" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sectorLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sector && (
            <p className="text-sm text-red-500">{errors.sector.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeCount" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Número de empleados *
            </Label>
            <Select
              value={watch('employeeCount')}
              onValueChange={(value) => setValue('employeeCount', value)}
            >
              <SelectTrigger className={errors.employeeCount ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {employeeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeCount && (
              <p className="text-sm text-red-500">{errors.employeeCount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyClients" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Clientes mensuales (aprox) *
            </Label>
            <Select
              value={watch('monthlyClients')}
              onValueChange={(value) => setValue('monthlyClients', value)}
            >
              <SelectTrigger className={errors.monthlyClients ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {clientOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.monthlyClients && (
              <p className="text-sm text-red-500">{errors.monthlyClients.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Continuar'}
          </Button>
        </div>
      </form>
    </div>
  )
}