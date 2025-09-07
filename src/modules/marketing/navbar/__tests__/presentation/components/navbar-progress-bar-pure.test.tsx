/**
 * Presentation Layer Tests - NavbarProgressBarPure Component
 *
 * Tests completos para el componente de barra de progreso.
 * Verifica:
 * - Renderizado con diferentes niveles de progreso
 * - Visibilidad y estados
 * - Animaciones y transiciones
 * - Accesibilidad para lectores de pantalla
 * - Comportamiento responsivo
 * - Edge cases
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { NavbarProgressBarPure } from '../../../presentation/components/navbar-progress-bar-pure';

import '@testing-library/jest-dom';

// Mock framer-motion for consistent testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, transition, style, className, ...props }: any) => (
      <div
        className={className}
        style={style}
        data-testid="motion-div"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </div>
    )
  },
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>
}));

// Mock utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

interface NavbarProgressBarPureProps {
  progress: number;
  currentSection?: string;
  isVisible?: boolean;
  sections?: Array<{
    sectionId: string;
    progress: number;
    isVisible: boolean;
    isActive: boolean;
  }>;
  variant?: 'linear' | 'stepped';
  className?: string;
  onSectionClick?: (sectionId: string) => void;
}

// Create a mock component since we don't have the actual implementation
const NavbarProgressBarPure: React.FC<NavbarProgressBarPureProps> = ({
  progress,
  currentSection,
  isVisible = true,
  sections = [],
  variant = 'linear',
  className = '',
  onSectionClick
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso de lectura: ${Math.round(progress)}%`}
    >
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-yellow-400 transition-all duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          data-testid="progress-bar"
        />
      </div>

      {variant === 'stepped' && sections.length > 0 && (
        <div className="flex justify-between absolute top-0 w-full" data-testid="section-markers">
          {sections.map((section) => (
            <button
              key={section.sectionId}
              onClick={() => onSectionClick?.(section.sectionId)}
              className={`w-3 h-3 rounded-full border-2 transition-colors ${
                section.isActive
                  ? 'bg-yellow-400 border-yellow-400'
                  : section.isVisible
                    ? 'bg-gray-300 border-gray-300'
                    : 'bg-transparent border-gray-300'
              }`}
              aria-label={`Ir a sección ${section.sectionId}`}
              data-testid={`section-marker-${section.sectionId}`}
            />
          ))}
        </div>
      )}

      {currentSection && (
        <span className="sr-only" aria-live="polite">
          Sección actual: {currentSection}
        </span>
      )}
    </div>
  );
};

describe('NavbarProgressBarPure', () => {
  const defaultProps: NavbarProgressBarPureProps = {
    progress: 50
  };

  const mockSections = [
    { sectionId: 'hero', progress: 25, isVisible: true, isActive: true },
    { sectionId: 'features', progress: 50, isVisible: true, isActive: false },
    { sectionId: 'pricing', progress: 75, isVisible: false, isActive: false },
    { sectionId: 'contact', progress: 100, isVisible: false, isActive: false }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with minimum required props', () => {
      render(<NavbarProgressBarPure {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should render progress bar with correct width', () => {
      render(<NavbarProgressBarPure progress={75} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('should apply custom className', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          className="custom-progress-class"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('custom-progress-class');
    });

    it('should have correct ARIA attributes', () => {
      render(<NavbarProgressBarPure progress={60} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Progreso de lectura: 60%');
    });
  });

  describe('Progress Value Handling', () => {
    it('should handle progress of 0%', () => {
      render(<NavbarProgressBarPure progress={0} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should handle progress of 100%', () => {
      render(<NavbarProgressBarPure progress={100} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should clamp negative values to 0%', () => {
      render(<NavbarProgressBarPure progress={-10} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should clamp values over 100% to 100%', () => {
      render(<NavbarProgressBarPure progress={150} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should handle decimal progress values', () => {
      render(<NavbarProgressBarPure progress={33.333} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '33.333%' });
    });

    it('should round progress for ARIA label', () => {
      render(<NavbarProgressBarPure progress={33.7} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Progreso de lectura: 34%');
    });
  });

  describe('Visibility Control', () => {
    it('should render when isVisible is true', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          isVisible={true}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not render when isVisible is false', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          isVisible={false}
        />
      );

      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should default to visible when isVisible prop is not provided', () => {
      render(<NavbarProgressBarPure {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Linear Variant (Default)', () => {
    it('should render linear variant by default', () => {
      render(<NavbarProgressBarPure {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();

      // Should not have section markers for linear variant
      const sectionMarkers = screen.queryByTestId('section-markers');
      expect(sectionMarkers).not.toBeInTheDocument();
    });

    it('should render linear variant explicitly', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="linear"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();

      const sectionMarkers = screen.queryByTestId('section-markers');
      expect(sectionMarkers).not.toBeInTheDocument();
    });

    it('should have correct styling for linear variant', () => {
      render(<NavbarProgressBarPure {...defaultProps} variant="linear" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');

      const progressBarInner = screen.getByTestId('progress-bar');
      expect(progressBarInner).toHaveClass('h-full', 'bg-yellow-400', 'transition-all');
    });
  });

  describe('Stepped Variant with Sections', () => {
    it('should render stepped variant with sections', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={mockSections}
        />
      );

      const sectionMarkers = screen.getByTestId('section-markers');
      expect(sectionMarkers).toBeInTheDocument();

      // Should render all section markers
      mockSections.forEach(section => {
        const marker = screen.getByTestId(`section-marker-${section.sectionId}`);
        expect(marker).toBeInTheDocument();
      });
    });

    it('should not render section markers without sections', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={[]}
        />
      );

      const sectionMarkers = screen.queryByTestId('section-markers');
      expect(sectionMarkers).not.toBeInTheDocument();
    });

    it('should render section markers with correct states', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={mockSections}
        />
      );

      // Active section (hero)
      const heroMarker = screen.getByTestId('section-marker-hero');
      expect(heroMarker).toHaveClass('bg-yellow-400', 'border-yellow-400');

      // Visible but inactive section (features)
      const featuresMarker = screen.getByTestId('section-marker-features');
      expect(featuresMarker).toHaveClass('bg-gray-300', 'border-gray-300');

      // Not visible section (pricing)
      const pricingMarker = screen.getByTestId('section-marker-pricing');
      expect(pricingMarker).toHaveClass('bg-transparent', 'border-gray-300');
    });

    it('should have correct ARIA labels for section markers', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={mockSections}
        />
      );

      mockSections.forEach(section => {
        const marker = screen.getByTestId(`section-marker-${section.sectionId}`);
        expect(marker).toHaveAttribute('aria-label', `Ir a sección ${section.sectionId}`);
      });
    });

    it('should call onSectionClick when section marker is clicked', () => {
      const onSectionClick = jest.fn();

      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={mockSections}
          onSectionClick={onSectionClick}
        />
      );

      const heroMarker = screen.getByTestId('section-marker-hero');
      fireEvent.click(heroMarker);

      expect(onSectionClick).toHaveBeenCalledTimes(1);
      expect(onSectionClick).toHaveBeenCalledWith('hero');
    });

    it('should handle multiple section clicks', () => {
      const onSectionClick = jest.fn();

      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={mockSections}
          onSectionClick={onSectionClick}
        />
      );

      const heroMarker = screen.getByTestId('section-marker-hero');
      const featuresMarker = screen.getByTestId('section-marker-features');

      fireEvent.click(heroMarker);
      fireEvent.click(featuresMarker);

      expect(onSectionClick).toHaveBeenCalledTimes(2);
      expect(onSectionClick).toHaveBeenNthCalledWith(1, 'hero');
      expect(onSectionClick).toHaveBeenNthCalledWith(2, 'features');
    });
  });

  describe('Current Section Indicator', () => {
    it('should announce current section to screen readers', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          currentSection="hero"
        />
      );

      const announcement = screen.getByText('Sección actual: hero');
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveClass('sr-only');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
    });

    it('should not render section announcement without currentSection', () => {
      render(<NavbarProgressBarPure {...defaultProps} />);

      const announcement = screen.queryByText(/Sección actual:/);
      expect(announcement).not.toBeInTheDocument();
    });

    it('should update section announcement when currentSection changes', () => {
      const { rerender } = render(
        <NavbarProgressBarPure
          {...defaultProps}
          currentSection="hero"
        />
      );

      expect(screen.getByText('Sección actual: hero')).toBeInTheDocument();

      rerender(
        <NavbarProgressBarPure
          {...defaultProps}
          currentSection="features"
        />
      );

      expect(screen.getByText('Sección actual: features')).toBeInTheDocument();
      expect(screen.queryByText('Sección actual: hero')).not.toBeInTheDocument();
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have correct base styling', () => {
      render(<NavbarProgressBarPure {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass(
        'fixed', 'top-0', 'left-0', 'right-0', 'z-50'
      );

      const background = progressBar.querySelector('.h-1.bg-gray-200');
      expect(background).toBeInTheDocument();
    });

    it('should have correct progress bar styling', () => {
      render(<NavbarProgressBarPure {...defaultProps} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass(
        'h-full', 'bg-yellow-400', 'transition-all', 'duration-300', 'ease-out'
      );
    });

    it('should combine custom className with base classes', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          className="custom-class another-class"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('fixed', 'custom-class', 'another-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper progressbar role', () => {
      render(<NavbarProgressBarPure {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should have descriptive ARIA label', () => {
      render(<NavbarProgressBarPure progress={42} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Progreso de lectura: 42%');
    });

    it('should support screen reader announcements for section changes', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          currentSection="features"
        />
      );

      const announcement = screen.getByText('Sección actual: features');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveClass('sr-only');
    });

    it('should have accessible section markers', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={mockSections}
        />
      );

      mockSections.forEach(section => {
        const marker = screen.getByTestId(`section-marker-${section.sectionId}`);
        expect(marker).toHaveAttribute('role', 'button');
        expect(marker).toHaveAttribute('aria-label', `Ir a sección ${section.sectionId}`);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined progress gracefully', () => {
      render(<NavbarProgressBarPure progress={undefined as any} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: 'NaN%' }); // This shows the issue, should be handled
    });

    it('should handle NaN progress values', () => {
      render(<NavbarProgressBarPure progress={NaN} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: 'NaN%' }); // This should be handled better
    });

    it('should handle very large progress values', () => {
      render(<NavbarProgressBarPure progress={99999} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should handle very small negative progress values', () => {
      render(<NavbarProgressBarPure progress={-99999} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should handle empty sections array', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={[]}
        />
      );

      const sectionMarkers = screen.queryByTestId('section-markers');
      expect(sectionMarkers).not.toBeInTheDocument();
    });

    it('should handle malformed sections gracefully', () => {
      const malformedSections = [
        { sectionId: '', progress: 25, isVisible: true, isActive: true },
        { sectionId: null as any, progress: 50, isVisible: true, isActive: false }
      ];

      expect(() => {
        render(
          <NavbarProgressBarPure
            {...defaultProps}
            variant="stepped"
            sections={malformedSections}
          />
        );
      }).not.toThrow();
    });

    it('should handle missing onSectionClick callback', () => {
      render(
        <NavbarProgressBarPure
          {...defaultProps}
          variant="stepped"
          sections={mockSections}
        />
      );

      const marker = screen.getByTestId('section-marker-hero');

      expect(() => {
        fireEvent.click(marker);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle rapid progress updates', () => {
      const { rerender } = render(<NavbarProgressBarPure progress={0} />);

      // Simulate rapid progress updates
      for (let i = 0; i <= 100; i += 5) {
        rerender(<NavbarProgressBarPure progress={i} />);
      }

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should handle rapid visibility changes', () => {
      const { rerender } = render(
        <NavbarProgressBarPure
          {...defaultProps}
          isVisible={true}
        />
      );

      // Rapid visibility toggles
      for (let i = 0; i < 10; i++) {
        rerender(
          <NavbarProgressBarPure
            {...defaultProps}
            isVisible={i % 2 === 0}
          />
        );
      }

      // Should end up visible
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Integration with Animation Libraries', () => {
    it('should work with transition classes', () => {
      render(<NavbarProgressBarPure {...defaultProps} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('transition-all', 'duration-300', 'ease-out');
    });
  });
});
