/**
 * Mobile Responsive Wrapper Component
 *
 * Provides responsive design utilities and mobile-first layouts
 * for the admin dashboard across all device sizes.
 */

'use client';

import React, { useEffect,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { ChevronLeft, ChevronRight,Menu, X } from 'lucide-react';

import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  mobileBreakpoint?: number;
}

interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  orientation: 'portrait' | 'landscape';
}

export const useResponsive = (): UseResponsiveReturn => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  return {
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
    screenWidth: dimensions.width,
    orientation: dimensions.width > dimensions.height ? 'landscape' : 'portrait',
  };
};

export const MobileResponsiveWrapper = ({
  children,
  sidebar,
  header,
  mobileBreakpoint = 768,
}: ResponsiveWrapperProps) => {
  const { isMobile, isTablet, screenWidth } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setCollapsedSidebar(!collapsedSidebar);

  return (
    <div className="responsive-admin-layout flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="bg-white shadow-md"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      {sidebar && (
        <>
          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isMobile && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black bg-opacity-50"
                onClick={toggleSidebar}
              />
            )}
          </AnimatePresence>

          {/* Sidebar Content */}
          <AnimatePresence>
            {(sidebarOpen || !isMobile) && (
              <motion.div
                initial={isMobile ? { x: -300 } : { width: 0 }}
                animate={
                  isMobile
                    ? { x: 0 }
                    : { width: collapsedSidebar ? 60 : 280 }
                }
                exit={isMobile ? { x: -300 } : { width: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`
                  ${isMobile ? 'fixed' : 'relative'} 
                  z-50 h-full bg-white border-r border-gray-200 shadow-lg
                  ${isMobile ? 'w-80' : ''}
                `}
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  {!collapsedSidebar && (
                    <h2 className="text-lg font-semibold text-gray-900">
                      Admin Panel
                    </h2>
                  )}

                  <div className="flex items-center space-x-2">
                    {!isMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCollapse}
                      >
                        {collapsedSidebar ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronLeft className="w-4 h-4" />
                        )}
                      </Button>
                    )}

                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSidebar}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sidebar Content */}
                <div className="overflow-y-auto h-full pb-16">
                  {sidebar}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {header && (
          <div className={`
            bg-white border-b border-gray-200 
            ${isMobile ? 'pl-16 pr-4' : 'px-6'} py-4
          `}>
            {header}
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className={`
            p-4 
            ${isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8'}
            max-w-full
          `}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Responsive Grid Component
 *
 * Automatically adjusts grid columns based on screen size
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-6',
  className = '',
}: ResponsiveGridProps) => {
  const { isMobile, isTablet } = useResponsive();

  const getGridCols = () => {
    if (isMobile) return `grid-cols-${columns.mobile || 1}`;
    if (isTablet) return `grid-cols-${columns.tablet || 2}`;
    return `grid-cols-${columns.desktop || 3}`;
  };

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Responsive Card Component
 *
 * Adjusts padding and sizing based on screen size
 */
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const ResponsiveCard = ({
  children,
  className = '',
  compact = false,
}: ResponsiveCardProps) => {
  const { isMobile } = useResponsive();

  const getPadding = () => {
    if (compact) return isMobile ? 'p-3' : 'p-4';
    return isMobile ? 'p-4' : 'p-6';
  };

  return (
    <Card className={`${getPadding()} ${className}`}>
      {children}
    </Card>
  );
};

/**
 * Responsive Table Wrapper
 *
 * Handles table overflow and mobile scrolling
 */
interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable = ({
  children,
  className = '',
}: ResponsiveTableProps) => {
  const { isMobile } = useResponsive();

  return (
    <div className={`
      ${isMobile ? 'overflow-x-auto -mx-4 px-4' : 'overflow-x-auto'}
      ${className}
    `}>
      <div className={isMobile ? 'min-w-[600px]' : ''}>
        {children}
      </div>
    </div>
  );
};

/**
 * Responsive Stack Component
 *
 * Switches between horizontal and vertical layouts
 */
interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: {
    mobile?: 'horizontal' | 'vertical';
    desktop?: 'horizontal' | 'vertical';
  };
  spacing?: string;
  className?: string;
}

export const ResponsiveStack = ({
  children,
  direction = { mobile: 'vertical', desktop: 'horizontal' },
  spacing = 'space-y-4 lg:space-y-0 lg:space-x-4',
  className = '',
}: ResponsiveStackProps) => {
  const { isMobile } = useResponsive();

  const getFlexDirection = () => {
    const mobileDir = direction.mobile === 'horizontal' ? 'flex-row' : 'flex-col';
    const desktopDir = direction.desktop === 'horizontal' ? 'lg:flex-row' : 'lg:flex-col';
    return `${mobileDir} ${desktopDir}`;
  };

  return (
    <div className={`flex ${getFlexDirection()} ${spacing} ${className}`}>
      {children}
    </div>
  );
};

export default MobileResponsiveWrapper;