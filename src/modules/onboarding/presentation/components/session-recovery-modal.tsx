'use client';

/**
 * Enhanced Session Recovery Modal Component
 * Shows when an incomplete onboarding session is detected with improved UX
 */

import { useEffect,useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence,motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Timer,
  User} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/modules/shared/presentation/components/ui/alert-dialog';
import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Progress } from '@/modules/shared/presentation/components/ui/progress';

interface SessionRecoveryModalProps {
  open: boolean;
  onResume: () => void;
  onStartFresh: () => void;
  lastActivityDate: Date | null;
  completionPercentage: number;
  currentStep?: string;
  progressInfo?: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    estimatedTimeRemaining: number;
    completedSteps: number;
  } | null;
  estimatedTimeRemaining?: number;
  userName?: string | null;
  isAuthenticated?: boolean;
}

const stepNames: Record<string, string> = {
  'business-info': 'Información del Negocio',
  'whatsapp-integration': 'Integración de WhatsApp',
  'phone-verification': 'Verificación del Teléfono',
  'bot-setup': 'Configuración del Bot',
  'testing': 'Pruebas',
  'customization': 'Personalización',
  'completion': 'Finalización',
};

const stepIcons: Record<string, React.ReactNode> = {
  'business-info': '🏢',
  'whatsapp-integration': '💬',
  'phone-verification': '📱',
  'bot-setup': '🤖',
  'testing': '🧪',
  'customization': '🎨',
  'completion': '🎉',
};

export function SessionRecoveryModal({
  open,
  onResume,
  onStartFresh,
  lastActivityDate,
  completionPercentage,
  currentStep = 'business-info',
  progressInfo,
  estimatedTimeRemaining = 0,
  userName,
  isAuthenticated,
}: SessionRecoveryModalProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    setIsOpen(open);
    if (open) {
      // Trigger progress animation when modal opens
      setTimeout(() => setAnimateProgress(true), 100);
    } else {
      setAnimateProgress(false);
    }
  }, [open]);

  const handleResume = () => {
    setIsOpen(false);
    onResume();
  };

  const handleStartFresh = () => {
    setIsOpen(false);
    onStartFresh();
  };

  const timeAgo = lastActivityDate
    ? formatDistanceToNow(lastActivityDate, {
        addSuffix: true,
        locale: es
      })
    : '';

  const getGreeting = () => {
    if (userName) {
      return `¡Hola de nuevo, ${userName}!`;
    }
    return '¡Bienvenido de vuelta!';
  };

  const getTimeEstimateText = () => {
    if (!estimatedTimeRemaining) return null;

    if (estimatedTimeRemaining <= 5) {
      return '¡Casi terminas! Solo faltan unos minutos';
    } else if (estimatedTimeRemaining <= 10) {
      return `Solo ${estimatedTimeRemaining} minutos para completar`;
    } else {
      return `Aproximadamente ${estimatedTimeRemaining} minutos restantes`;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-lg overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertDialogHeader>
            {/* Header with icon animation */}
            <div className="flex items-start gap-4 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1
                }}
                className="relative"
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <RotateCcw className="h-7 w-7 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </motion.div>
              </motion.div>

              <div className="flex-1">
                <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {getGreeting()}
                </AlertDialogTitle>
                {isAuthenticated && (
                  <Badge variant="secondary" className="mt-2">
                    <User className="h-3 w-3 mr-1" />
                    Sesión guardada
                  </Badge>
                )}
              </div>
            </div>

            <AlertDialogDescription className="space-y-4 pt-2">
              <p className="text-base text-gray-700">
                Encontramos tu progreso guardado. Puedes retomar exactamente donde lo dejaste.
              </p>

              {/* Progress Card with enhanced design */}
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 space-y-4 border border-blue-100"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Progress header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{stepIcons[currentStep]}</div>
                    <div>
                      <p className="text-sm text-gray-500">Estás en</p>
                      <p className="font-semibold text-gray-900">
                        {stepNames[currentStep]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {completionPercentage}%
                    </p>
                    <p className="text-xs text-gray-500">completado</p>
                  </div>
                </div>

                {/* Animated Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Paso {progressInfo?.currentStep || 1} de {progressInfo?.totalSteps || 7}</span>
                    <span>{progressInfo?.completedSteps || 0} pasos completados</span>
                  </div>
                  <div className="relative">
                    <Progress value={0} className="h-3 bg-gray-200" />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: animateProgress ? `${completionPercentage}%` : 0 }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {lastActivityDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Guardado <strong>{timeAgo}</strong>
                      </span>
                    </div>
                  )}

                  {estimatedTimeRemaining > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        <strong>~{estimatedTimeRemaining} min</strong> restantes
                      </span>
                    </div>
                  )}
                </div>

                {/* Motivational message */}
                {getTimeEstimateText() && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{getTimeEstimateText()}</span>
                  </motion.div>
                )}
              </motion.div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6">
            <AlertDialogCancel
              onClick={handleStartFresh}
              className="w-full sm:w-auto group hover:bg-gray-100 transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Empezar de nuevo
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResume}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group transition-all shadow-lg"
            >
              Continuar donde lo dejé
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}