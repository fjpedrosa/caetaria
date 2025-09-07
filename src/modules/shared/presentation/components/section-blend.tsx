'use client';

import { cn } from '@/lib/utils';

interface SectionBlendProps {
  type?: 'wave' | 'curve' | 'fade' | 'organic';
  height?: number; // in rem units
  color?: 'neptune' | 'whatsapp' | 'neutral' | string;
  className?: string;
  flip?: boolean;
  animate?: boolean;
}

export function SectionBlend({
  type = 'wave',
  height = 6,
  color = 'neutral',
  className,
  flip = false,
  animate = true,
}: SectionBlendProps) {
  // Color mapping
  const getColor = (colorName: string) => {
    if (colorName === 'neptune') return 'hsla(220, 100%, 62%, 0.1)';
    if (colorName === 'whatsapp') return 'hsla(150, 100%, 75%, 0.1)';
    if (colorName === 'neutral') return 'hsla(0, 0%, 50%, 0.05)';
    return colorName;
  };

  const fillColor = getColor(color);

  // SVG paths for different blend types
  const paths = {
    wave: {
      viewBox: '0 0 1200 120',
      path: 'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z',
    },
    curve: {
      viewBox: '0 0 1200 120',
      path: 'M0,40Q300,80,600,40T1200,40L1200,0L0,0Z',
    },
    organic: {
      viewBox: '0 0 1200 120',
      path: 'M0,0C150,60,350,20,600,40C850,60,1050,20,1200,0L1200,120L0,120Z',
    },
    fade: {
      viewBox: '0 0 1200 120',
      path: 'M0,0L1200,0L1200,120L0,120Z',
    },
  };

  const currentPath = paths[type];

  return (
    <div
      className={cn(
        'relative w-full pointer-events-none',
        flip && 'rotate-180',
        className
      )}
      style={{
        height: `${height}rem`,
        marginTop: `-${height / 2}rem`,
        marginBottom: `-${height / 2}rem`,
        zIndex: 5,
      }}
      aria-hidden="true"
    >
      {type === 'fade' ? (
        // Gradient fade blend
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to ${flip ? 'top' : 'bottom'}, 
              transparent 0%, 
              ${fillColor} 50%, 
              transparent 100%)`,
          }}
        />
      ) : (
        // SVG shape blend
        <svg
          className={cn(
            'absolute inset-0 w-full h-full',
            animate && 'animate-wave-slow'
          )}
          viewBox={currentPath.viewBox}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Multiple layers for depth */}
          <path
            d={currentPath.path}
            fill={fillColor}
            opacity="0.4"
            className={animate ? 'animate-wave-flow' : ''}
          />
          <path
            d={currentPath.path}
            fill={fillColor}
            opacity="0.3"
            transform="translate(0, 5)"
            className={animate ? 'animate-wave-flow-delayed' : ''}
          />
          <path
            d={currentPath.path}
            fill={fillColor}
            opacity="0.2"
            transform="translate(0, 10)"
            className={animate ? 'animate-wave-flow-slow' : ''}
          />
        </svg>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes wave-flow {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(-25px) translateY(-5px);
          }
          50% {
            transform: translateX(25px) translateY(5px);
          }
          75% {
            transform: translateX(-15px) translateY(-3px);
          }
        }

        @keyframes wave-flow-delayed {
          0%, 100% {
            transform: translateX(0) translateY(5px);
          }
          25% {
            transform: translateX(20px) translateY(8px);
          }
          50% {
            transform: translateX(-20px) translateY(2px);
          }
          75% {
            transform: translateX(10px) translateY(6px);
          }
        }

        @keyframes wave-flow-slow {
          0%, 100% {
            transform: translateX(0) translateY(10px);
          }
          33% {
            transform: translateX(-30px) translateY(12px);
          }
          66% {
            transform: translateX(30px) translateY(8px);
          }
        }

        .animate-wave-flow {
          animation: wave-flow 20s ease-in-out infinite;
        }

        .animate-wave-flow-delayed {
          animation: wave-flow-delayed 25s ease-in-out infinite;
        }

        .animate-wave-flow-slow {
          animation: wave-flow-slow 30s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-wave-flow,
          .animate-wave-flow-delayed,
          .animate-wave-flow-slow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}