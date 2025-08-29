'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FeatureIcon, Icon } from '@/components/ui/icon';
import { 
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Settings,
  Sparkles,
  UserPlus,
  Zap
} from '@/lib/icons';

const steps = [
  {
    number: '1',
    title: 'Regístrate',
    description: 'Crea tu cuenta en menos de 2 minutos con tu email empresarial',
    icon: UserPlus,
    color: 'primary' as const,
    details: [
      'Sin tarjeta de crédito',
      'Verificación instantánea',
      'Acceso completo'
    ]
  },
  {
    number: '2',
    title: 'Configura',
    description: 'Conecta tu WhatsApp Business y personaliza tu bot con IA',
    icon: Settings,
    color: 'secondary' as const,
    details: [
      'Integración guiada',
      'Templates predefinidos',
      'Personalización fácil'
    ]
  },
  {
    number: '3',
    title: 'Automatiza',
    description: 'Tu bot responde 24/7 mientras tú te enfocas en crecer',
    icon: MessageCircle,
    color: 'primary' as const,
    details: [
      'Respuestas inteligentes',
      'Escalación automática',
      'Analytics en tiempo real'
    ]
  }
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="px-4 py-2 mb-6">
            <Icon icon={Zap} size="small" iconClassName="w-4 h-4 mr-2" />
            Proceso Simple
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Comienza en 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-2">
              3 simples pasos
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde el registro hasta la automatización completa en menos de 10 minutos
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, rotateX: -10 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: -10 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden md:block absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2 z-0"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-primary/30 to-secondary/30" />
                  <Icon 
                    icon={ArrowRight} 
                    size="small" 
                    iconClassName="absolute right-0 top-1/2 -translate-y-1/2 text-secondary"
                  />
                </motion.div>
              )}

              <Card className="relative p-6 h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm group">
                {/* Step Number */}
                <motion.div
                  className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  {step.number}
                </motion.div>

                {/* Layout horizontal mejorado */}
                <div className="flex items-start gap-6">
                  {/* Icon a la izquierda */}
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FeatureIcon
                      icon={step.icon}
                      variant={step.color}
                      className="shadow-md"
                    />
                  </motion.div>

                  {/* Contenido a la derecha */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4">
                      {step.description}
                    </p>

                    {/* Details list */}
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <motion.li
                          key={detailIndex}
                          className="flex items-center gap-2 text-sm"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 1 + index * 0.2 + detailIndex * 0.1 
                          }}
                        >
                          <Icon
                            icon={CheckCircle}
                            size="small"
                            iconClassName="text-success w-4 h-4 flex-shrink-0"
                          />
                          <span className="text-foreground/80">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <p className="text-muted-foreground mb-4">
            ¿Listo para automatizar tu WhatsApp Business?
          </p>
          <motion.a
            href="/onboarding"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Empieza ahora gratis
            <Icon icon={ArrowRight} size="small" iconClassName="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}