'use client';

import { AlertTriangle,TrendingDown, XCircle } from 'lucide-react';

import { PainPoint } from '../../domain/types';

interface IndustryPainPointsProps {
  painPoints: PainPoint[];
  industryName: string;
}

export function IndustryPainPoints({ painPoints, industryName }: IndustryPainPointsProps) {
  const getIcon = (index: number) => {
    const icons = [XCircle, TrendingDown, AlertTriangle];
    const Icon = icons[index % icons.length];
    return <Icon className="h-6 w-6" />;
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Los desafíos del sector {industryName.toLowerCase()}
          </h2>
          <p className="text-lg text-gray-600">
            Sabemos los problemas que enfrentas cada día. Por eso creamos una solución específica para ti.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {painPoints.map((painPoint, index) => (
            <div
              key={painPoint.id}
              className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
                {getIcon(index)}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {painPoint.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {painPoint.description}
              </p>

              {/* Cost indicator */}
              {painPoint.cost && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-red-600">
                    Costo actual: {painPoint.cost}
                  </p>
                </div>
              )}

              {/* Decorative element */}
              <div className="absolute top-0 right-0 -mt-2 -mr-2">
                <div className="w-8 h-8 bg-red-500 rounded-full opacity-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Solution teaser */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-700">
            <span className="font-semibold">La buena noticia:</span> Neptunik resuelve todos estos problemas con WhatsApp Business
          </p>
        </div>
      </div>
    </section>
  );
}