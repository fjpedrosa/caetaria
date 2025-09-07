'use client';

import { Quote, Star } from 'lucide-react';

import { Testimonial } from '../../domain/types';

interface IndustryTestimonialsProps {
  testimonials: Testimonial[];
  industryName: string;
}

export function IndustryTestimonials({ testimonials, industryName }: IndustryTestimonialsProps) {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Empresas de {industryName.toLowerCase()} que ya confían en Neptunik
          </h2>
          <p className="text-lg text-gray-600">
            Descubre cómo están transformando su comunicación con clientes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-purple-200 mb-4" />

              {/* Quote text */}
              <blockquote className="text-gray-700 mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Metric highlight */}
              {testimonial.metric && (
                <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <p className="text-center font-bold text-purple-600">
                    {testimonial.metric}
                  </p>
                </div>
              )}

              {/* Author info */}
              <div className="flex items-center gap-4">
                {/* Avatar placeholder */}
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {testimonial.person.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {testimonial.person}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Rating stars */}
              <div className="mt-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional testimonials teaser */}
        {testimonials.length === 1 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Y muchas más empresas de {industryName.toLowerCase()} están obteniendo resultados similares
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-medium underline">
              Ver más casos de éxito →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}