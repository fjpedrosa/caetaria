'use client';

import React, { useEffect,useState } from 'react';
import { Eye, EyeOff,Maximize2, Minimize2, Monitor, Smartphone, Tablet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewportSize {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const viewportSizes: ViewportSize[] = [
  { name: 'Mobile S', width: 320, height: 568, icon: Smartphone, color: 'bg-red-500' },
  { name: 'Mobile M', width: 375, height: 667, icon: Smartphone, color: 'bg-orange-500' },
  { name: 'Mobile L', width: 425, height: 812, icon: Smartphone, color: 'bg-yellow-500' },
  { name: 'Tablet', width: 768, height: 1024, icon: Tablet, color: 'bg-green-500' },
  { name: 'Laptop', width: 1024, height: 768, icon: Monitor, color: 'bg-blue-500' },
  { name: 'Desktop', width: 1440, height: 900, icon: Monitor, color: 'bg-purple-500' },
  { name: '4K', width: 2560, height: 1440, icon: Monitor, color: 'bg-pink-500' }
];

/**
 * Responsive Test Overlay
 * Development tool to test responsive design across different breakpoints
 * Only shown in development mode
 */
export function ResponsiveTestOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentViewport, setCurrentViewport] = useState<ViewportSize | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') return null;

  const getCurrentBreakpoint = () => {
    const width = windowSize.width;
    if (width < 640) return 'sm';
    if (width < 768) return 'md';
    if (width < 1024) return 'lg';
    if (width < 1280) return 'xl';
    return '2xl';
  };

  const getBreakpointColor = (breakpoint: string) => {
    switch (breakpoint) {
      case 'sm': return 'text-red-600 bg-red-50';
      case 'md': return 'text-orange-600 bg-orange-50';
      case 'lg': return 'text-yellow-600 bg-yellow-50';
      case 'xl': return 'text-green-600 bg-green-50';
      case '2xl': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg border-2"
        >
          <Eye className="w-4 h-4 mr-2" />
          Responsive Test
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-gray-200 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Responsive Test</h3>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>

        {/* Current viewport info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Current Size</span>
            <Badge 
              className={cn(
                'text-xs',
                getBreakpointColor(getCurrentBreakpoint())
              )}
            >
              {getCurrentBreakpoint().toUpperCase()}
            </Badge>
          </div>
          <div className="text-sm font-mono text-gray-900">
            {windowSize.width} × {windowSize.height}px
          </div>
        </div>

        {/* Viewport preset buttons */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 mb-2">Test Viewports:</div>
          <div className="grid grid-cols-2 gap-2">
            {viewportSizes.map((viewport) => {
              const Icon = viewport.icon;
              return (
                <Button
                  key={viewport.name}
                  onClick={() => {
                    // Simulate viewport size by opening dev tools console
                    console.log(`🔍 Testing ${viewport.name}: ${viewport.width}×${viewport.height}px`);
                    console.log(`💡 Tip: Use browser dev tools to simulate this viewport size`);
                    setCurrentViewport(viewport);
                  }}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-auto p-2 flex flex-col items-center gap-1",
                    currentViewport?.name === viewport.name && "bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{viewport.name}</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {viewport.width}×{viewport.height}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Current selection info */}
        {currentViewport && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-800 mb-1">Selected for testing:</div>
            <div className="text-sm font-semibold text-blue-900">
              {currentViewport.name} ({currentViewport.width}×{currentViewport.height}px)
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Use browser dev tools to simulate this viewport
            </div>
          </div>
        )}

        {/* Responsive design checklist */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-600 mb-2">Quick Checks:</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• Text readable at all sizes</div>
            <div>• Buttons easily tappable (44px+)</div>
            <div>• Images scale properly</div>
            <div>• Navigation works on mobile</div>
            <div>• Forms are usable</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Responsive Design Debug Info
 * Shows current breakpoint and useful responsive design information
 */
export function ResponsiveDebugInfo() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-20 left-4 z-40 bg-black/80 text-white p-2 rounded text-xs font-mono">
      <div className="sm:hidden">XS (0-639px)</div>
      <div className="hidden sm:block md:hidden">SM (640-767px)</div>
      <div className="hidden md:block lg:hidden">MD (768-1023px)</div>
      <div className="hidden lg:block xl:hidden">LG (1024-1279px)</div>
      <div className="hidden xl:block 2xl:hidden">XL (1280-1535px)</div>
      <div className="hidden 2xl:block">2XL (1536px+)</div>
    </div>
  );
}