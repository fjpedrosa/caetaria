'use client';

import { ArrowUp, Calculator,TrendingUp } from 'lucide-react';

import { Button } from '@/modules/shared/presentation/components/ui/button';

import { MetricImprovement } from '../../domain/types';

interface IndustryMetricsProps {
  metrics: MetricImprovement[];
  industryName: string;
  onCalculateROI?: () => void;
}

export function IndustryMetrics({ metrics, industryName, onCalculateROI }: IndustryMetricsProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resultados comprobados en {industryName.toLowerCase()}
          </h2>
          <p className="text-lg text-gray-600">
            Métricas reales de empresas como la tuya que ya usan Neptunik
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all"
            >
              {/* Metric name */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-700">
                  {metric.metric}
                </h3>
              </div>

              {/* Before/After comparison */}
              <div className="space-y-4">
                {/* Before */}
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-gray-600">Antes</span>
                  <span className="font-semibold text-red-600">
                    {metric.before}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowUp className="h-6 w-6 text-green-500" />
                </div>

                {/* After */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Después</span>
                  <span className="font-semibold text-green-600">
                    {metric.after}
                  </span>
                </div>
              </div>

              {/* Improvement badge */}
              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-600">
                    {metric.improvement}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ROI Calculator CTA */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Calculator className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Calcula tu ROI personalizado
                  </h3>
                </div>
                <p className="text-gray-600">
                  Descubre cuánto puedes ahorrar y ganar con Neptunik en tu negocio de {industryName.toLowerCase()}
                </p>
              </div>
              <div>
                <Button
                  size="lg"
                  onClick={onCalculateROI}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Calcular mi ROI
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicator */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Basado en datos de <span className="font-semibold">+500 empresas</span> usando Neptunik
          </p>
        </div>
      </div>
    </section>
  );
}