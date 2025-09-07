'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { Button } from '@/modules/shared/presentation/components/ui/button';

import { UseCase } from '../../domain/types';

interface IndustryUseCasesProps {
  useCases: UseCase[];
  industryName: string;
  onLearnMore?: (useCase: UseCase) => void;
}

export function IndustryUseCases({ useCases, industryName, onLearnMore }: IndustryUseCasesProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Casos de uso específicos para {industryName.toLowerCase()}
          </h2>
          <p className="text-lg text-gray-600">
            Flujos de WhatsApp diseñados para resolver los desafíos únicos de tu industria
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase) => (
            <div
              key={useCase.id}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              {/* Icon and Title */}
              <div className="mb-4">
                {useCase.icon && (
                  <span className="text-4xl mb-3 block">{useCase.icon}</span>
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {useCase.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                {useCase.description}
              </p>

              {/* Example */}
              {useCase.example && (
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Ejemplo:</span> {useCase.example}
                  </p>
                </div>
              )}

              {/* Workflow steps */}
              {useCase.workflow && (
                <div className="space-y-2 mb-4">
                  {useCase.workflow.slice(0, 3).map((step) => (
                    <div key={step.step} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          step.automated ? 'text-green-500' : 'text-gray-400'
                        }`}
                      />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Paso {step.step}:</span> {step.action}
                        {step.automated && (
                          <span className="ml-1 text-xs text-green-600 font-medium">
                            (Automático)
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Learn more button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLearnMore?.(useCase)}
                className="w-full justify-between group"
              >
                Ver flujo completo
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Ver todos los flujos disponibles
            </Button>
            <Button size="lg" variant="outline">
              Descargar plantillas gratis
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}