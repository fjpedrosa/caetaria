'use client';

import { SeamlessSection } from '@/modules/shared/presentation/components/seamless-section';
import { SectionBlend } from '@/modules/shared/presentation/components/section-blend';
import { useSeamlessTransitions } from '@/modules/shared/presentation/hooks/use-seamless-transitions';

/**
 * Ejemplo de implementación de secciones sin líneas visibles
 * Este componente muestra cómo usar las utilidades de superposición
 */
export const SeamlessLayoutExample = () => {
  const { sectionRef: heroRef, transitionStyles: heroStyles } = useSeamlessTransitions();
  const { sectionRef: featuresRef, transitionStyles: featuresStyles } = useSeamlessTransitions();

  return (
    <div className="relative w-full">
      {/* Hero Section con blob decorativo que se extiende hacia abajo */}
      <SeamlessSection
        background="primary"
        className="min-h-screen"
        decorativeBlob={{
          position: 'bottom-right',
          color: '#3b82f6',
          size: 'xl',
          offset: { x: 10, y: 10 } // Se extiende fuera de la sección
        }}
      >
        <div
          ref={heroRef}
          className="container mx-auto px-4 py-20"
          style={heroStyles}
        >
          <h1 className="text-5xl font-bold mb-6">
            Diseño Sin Costuras
          </h1>
          <p className="text-xl text-muted-foreground">
            Las secciones fluyen naturalmente sin líneas divisorias
          </p>
        </div>
      </SeamlessSection>

      {/* Transición suave entre secciones */}
      <SectionBlend
        type="wave"
        height={6}
        fromColor="from-background"
        toColor="to-muted/30"
      />

      {/* Features Section con superposición */}
      <SeamlessSection
        background="secondary"
        overlap="top" // Se superpone con la sección anterior
        overlapAmount={3}
        className="relative z-20" // z-index más alto para superposición
        decorativeBlob={{
          position: 'top-left',
          color: '#10b981',
          size: 'lg',
          offset: { x: -5, y: -8 } // Blob que viene desde arriba
        }}
      >
        <div
          ref={featuresRef}
          className="container mx-auto px-4 py-20"
          style={featuresStyles}
        >
          <h2 className="text-4xl font-bold mb-12">
            Características Avanzadas
          </h2>

          {/* Grid con cards flotantes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
                style={{
                  // Cards con elevación diferente para profundidad
                  transform: `translateY(${i % 2 === 0 ? -20 : 0}px)`,
                  zIndex: 30 + i
                }}
              >
                <h3 className="text-xl font-semibold mb-3">
                  Feature {i}
                </h3>
                <p className="text-muted-foreground">
                  Contenido flotante con efecto de profundidad
                </p>
              </div>
            ))}
          </div>
        </div>
      </SeamlessSection>

      {/* Transición diagonal */}
      <SectionBlend
        type="diagonal"
        height={8}
      />

      {/* CTA Section con elementos superpuestos */}
      <SeamlessSection
        background="primary"
        overlap="both" // Se superpone arriba y abajo
        overlapAmount={2}
        className="relative z-10"
      >
        <div className="container mx-auto px-4 py-16 text-center">
          {/* Elemento decorativo flotante */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary rounded-full shadow-2xl z-40"
            aria-hidden="true"
          />

          <h2 className="text-3xl font-bold mb-6">
            Llamada a la Acción
          </h2>
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Comenzar Ahora
          </button>
        </div>
      </SeamlessSection>
    </div>
  );
};