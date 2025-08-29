import { z } from 'zod'

export const businessSectors = [
  'retail',
  'services',
  'restaurant',
  'health',
  'education',
  'technology',
  'real-estate',
  'automotive',
  'beauty',
  'fitness',
  'other'
] as const

export type BusinessSector = typeof businessSectors[number]

export const businessInfoSchema = z.object({
  businessName: z
    .string()
    .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
    .max(100, 'El nombre del negocio no puede superar los 100 caracteres'),
  sector: z.enum(businessSectors).refine(
    (val) => businessSectors.includes(val),
    { message: 'Debes seleccionar un sector' }
  ),
  employeeCount: z
    .string()
    .min(1, 'Debes seleccionar el número de empleados'),
  monthlyClients: z
    .string()
    .min(1, 'Debes indicar el número aproximado de clientes mensuales')
})

export const phoneNumberSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Número de teléfono inválido. Debe incluir código de país'
    )
    .transform(val => val.replace(/\s/g, '')),
  countryCode: z
    .string()
    .min(2, 'Código de país requerido')
    .max(4, 'Código de país inválido'),
  isWhatsAppBusiness: z.boolean()
})

export const autoMessageSchema = z.object({
  welcomeMessage: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede superar los 1000 caracteres'),
  responseTime: z.enum(['instant', '1min', '5min', '15min', 'custom']),
  enableKeywords: z.boolean(),
  keywords: z.array(z.string()).optional()
})

export const planSelectionSchema = z.object({
  planType: z.enum(['starter', 'pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']),
  addOns: z.array(z.string()).optional()
})

export const registrationSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener mayúsculas, minúsculas y números'
    ),
  confirmPassword: z.string(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, {
      message: 'Debes aceptar los términos y condiciones'
    }),
  acceptPrivacy: z
    .boolean()
    .refine(val => val === true, {
      message: 'Debes aceptar la política de privacidad'
    }),
  receiveUpdates: z.boolean()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

export const completeOnboardingSchema = z.object({
  businessInfo: businessInfoSchema,
  phoneNumber: phoneNumberSchema,
  autoMessage: autoMessageSchema,
  planSelection: planSelectionSchema,
  registration: registrationSchema
})

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>
export type PhoneNumberFormData = z.infer<typeof phoneNumberSchema>
export type AutoMessageFormData = z.infer<typeof autoMessageSchema>
export type PlanSelectionFormData = z.infer<typeof planSelectionSchema>
export type RegistrationFormData = z.infer<typeof registrationSchema>
export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>