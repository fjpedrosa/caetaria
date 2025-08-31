'use client'

import { useEffect,useState } from 'react'
import { ArrowLeft, CheckCircle2, PartyPopper,Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import type { OnboardingState, OnboardingStep } from '../../domain/types'
import {
  useClearOnboardingSessionMutation,
  useCompleteRegistrationMutation,
  useGetOnboardingSessionQuery,
  useSaveAutoMessageMutation,
  useSaveBusinessInfoMutation,
  useSavePhoneNumberMutation,
  useSavePlanSelectionMutation} from '../../infra/fake-onboarding-api'

import { OnboardingStepper } from './onboarding-stepper'
import { StepAutoMessage } from './step-auto-message'
import { StepBusinessInfo } from './step-business-info'
import { StepPhoneConnect } from './step-phone-connect'
import { StepPlanSelection } from './step-plan-selection'
import { StepRegistration } from './step-registration'

const STORAGE_KEY = 'onboarding_session'

const steps = [
  { number: 1, title: 'Tu negocio', description: 'Información básica' },
  { number: 2, title: 'WhatsApp', description: 'Conecta tu número' },
  { number: 3, title: 'Mensaje', description: 'Primera automatización' },
  { number: 4, title: 'Plan', description: 'Elige tu plan' },
  { number: 5, title: 'Registro', description: 'Crea tu cuenta' }
]

export function OnboardingWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepFromUrl = parseInt(searchParams.get('step') || '1') as OnboardingStep

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(stepFromUrl)
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([])
  const [sessionData, setSessionData] = useState<Partial<OnboardingState['data']>>({})
  const [isComplete, setIsComplete] = useState(false)

  const { data: existingSession } = useGetOnboardingSessionQuery()
  const [clearSession] = useClearOnboardingSessionMutation()

  const [saveBusinessInfo] = useSaveBusinessInfoMutation()
  const [savePhoneNumber] = useSavePhoneNumberMutation()
  const [saveAutoMessage] = useSaveAutoMessageMutation()
  const [savePlanSelection] = useSavePlanSelectionMutation()
  const [completeRegistration] = useCompleteRegistrationMutation()

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSessionData(parsed.data || {})
        setCompletedSteps(parsed.completedSteps || [])

        if (stepFromUrl === 1 && parsed.currentStep > 1) {
          setCurrentStep(parsed.currentStep)
          router.push(`/onboarding?step=${parsed.currentStep}`)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (currentStep !== stepFromUrl) {
      router.push(`/onboarding?step=${currentStep}`)
    }
  }, [currentStep, stepFromUrl, router])

  const trackAnalytics = (event: string, properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties)
    }
    console.log('[Analytics]', event, properties)
  }

  const saveToLocalStorage = (data: Partial<OnboardingState['data']>, step: OnboardingStep) => {
    const updatedSession = {
      currentStep: step,
      completedSteps: [...new Set([...completedSteps, currentStep])],
      data: { ...sessionData, ...data },
      metadata: {
        lastUpdatedAt: new Date().toISOString(),
        sessionId: existingSession?.metadata?.sessionId || `session_${Date.now()}`
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession))
    setSessionData(updatedSession.data)
    setCompletedSteps(updatedSession.completedSteps)
  }

  const handleNext = async (stepData: any) => {
    trackAnalytics('onboarding_step_complete', {
      step: currentStep,
      stepName: steps[currentStep - 1].title
    })

    try {
      switch (currentStep) {
        case 1:
          await saveBusinessInfo(stepData)
          saveToLocalStorage({ businessInfo: stepData }, 2)
          setCurrentStep(2)
          break

        case 2:
          await savePhoneNumber(stepData)
          saveToLocalStorage({ phoneNumber: stepData }, 3)
          setCurrentStep(3)
          break

        case 3:
          await saveAutoMessage(stepData)
          saveToLocalStorage({ autoMessage: stepData }, 4)
          setCurrentStep(4)
          break

        case 4:
          const priceVariant = stepData.priceVariant || 'A'
          await savePlanSelection({ ...stepData, priceVariant })
          saveToLocalStorage({ planSelection: stepData }, 5)
          setCurrentStep(5)
          break

        case 5:
          await completeRegistration(stepData)
          saveToLocalStorage({ registration: stepData }, 5)
          setIsComplete(true)
          trackAnalytics('onboarding_complete', {
            sessionId: existingSession?.metadata?.sessionId
          })
          break
      }
    } catch (error) {
      console.error('Error saving step data:', error)
    }

    trackAnalytics('onboarding_step_view', {
      step: currentStep + 1,
      stepName: steps[currentStep]?.title
    })
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep)
      trackAnalytics('onboarding_step_back', {
        from: currentStep,
        to: currentStep - 1
      })
    }
  }

  const handleRestart = async () => {
    await clearSession()
    localStorage.removeItem(STORAGE_KEY)
    setCurrentStep(1)
    setCompletedSteps([])
    setSessionData({})
    setIsComplete(false)
    router.push('/onboarding?step=1')
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-green-100 to-blue-100 text-green-600 mb-4">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <Sparkles className="absolute top-0 left-1/4 text-yellow-500 h-6 w-6 animate-bounce" />
              <Sparkles className="absolute top-4 right-1/4 text-purple-500 h-5 w-5 animate-pulse" />
              <PartyPopper className="absolute bottom-0 right-1/3 text-pink-500 h-6 w-6 animate-bounce delay-150" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ¡Bienvenido a la beta!
              </h1>
              <p className="text-xl text-gray-700">
                Tu cuenta ha sido creada exitosamente
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg space-y-4">
              <h2 className="font-semibold text-lg">Estás en acceso beta exclusivo</h2>
              <ul className="space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>14 días de prueba completamente gratis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Acceso anticipado a nuevas funcionalidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>50% de descuento de por vida como beta tester</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Soporte prioritario directo con el equipo</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600">
                En las próximas 24 horas recibirás un email con los pasos para conectar tu WhatsApp
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => router.push('/')}>
                  Ir al inicio
                </Button>
                <Button size="lg" variant="outline" onClick={handleRestart}>
                  Configurar otro negocio
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>

          <div className="text-sm text-gray-600">
            Paso {currentStep} de {steps.length}
          </div>
        </div>

        <Card className="p-8">
          <OnboardingStepper
            currentStep={currentStep}
            completedSteps={completedSteps}
            steps={steps}
            className="mb-8"
          />

          <div className="mt-8">
            {currentStep === 1 && (
              <StepBusinessInfo
                onNext={handleNext}
                onPrev={handlePrev}
                defaultValues={sessionData.businessInfo}
                isFirstStep
              />
            )}

            {currentStep === 2 && (
              <StepPhoneConnect
                onNext={handleNext}
                onPrev={handlePrev}
                defaultValues={sessionData.phoneNumber}
              />
            )}

            {currentStep === 3 && (
              <StepAutoMessage
                onNext={handleNext}
                onPrev={handlePrev}
                defaultValues={sessionData.autoMessage}
              />
            )}

            {currentStep === 4 && (
              <StepPlanSelection
                onNext={handleNext}
                onPrev={handlePrev}
                defaultValues={sessionData.planSelection}
              />
            )}

            {currentStep === 5 && (
              <StepRegistration
                onNext={handleNext}
                onPrev={handlePrev}
                defaultValues={sessionData.registration}
                isLastStep
              />
            )}
          </div>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>¿Necesitas ayuda? Contáctanos en soporte@whatsbotpro.com</p>
        </div>
      </div>
    </div>
  )
}