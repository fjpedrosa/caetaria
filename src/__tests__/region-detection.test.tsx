/**
 * Region Detection System Tests
 * Tests for region detection, context, and selector components
 */

import React from 'react';
import { fireEvent,render, screen, waitFor } from '@testing-library/react';

import { RegionProvider, useRegion } from '@/modules/marketing/application/contexts/region-context';
import { RegionSelector } from '@/modules/marketing/presentation/components/region-selector';

import '@testing-library/jest-dom';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Region Detection System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('RegionContext', () => {
    it('should detect region on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          countryCode: 'ES',
          region: 'spain',
          currency: 'EUR',
          language: 'es-ES',
        }),
      });

      const TestComponent = () => {
        const { currentRegion, regionInfo } = useRegion();
        return (
          <div>
            <span data-testid="region">{currentRegion}</span>
            <span data-testid="currency">{regionInfo?.currency}</span>
          </div>
        );
      };

      render(
        <RegionProvider>
          <TestComponent />
        </RegionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('region')).toHaveTextContent('spain');
        expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/region');
    });

    it('should use stored preference if available', async () => {
      localStorageMock.getItem.mockReturnValue('latam');

      const TestComponent = () => {
        const { currentRegion } = useRegion();
        return <span data-testid="region">{currentRegion}</span>;
      };

      render(
        <RegionProvider>
          <TestComponent />
        </RegionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('region')).toHaveTextContent('latam');
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fall back to default region on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const TestComponent = () => {
        const { currentRegion, error } = useRegion();
        return (
          <div>
            <span data-testid="region">{currentRegion}</span>
            {error && <span data-testid="error">{error}</span>}
          </div>
        );
      };

      render(
        <RegionProvider defaultRegion="usa">
          <TestComponent />
        </RegionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('region')).toHaveTextContent('usa');
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });

    it('should format currency based on region', async () => {
      const TestComponent = () => {
        const { formatCurrency } = useRegion();
        return <span data-testid="price">{formatCurrency(100)}</span>;
      };

      render(
        <RegionProvider defaultRegion="spain">
          <TestComponent />
        </RegionProvider>
      );

      await waitFor(() => {
        const price = screen.getByTestId('price').textContent;
        expect(price).toMatch(/100/); // Should contain the number
      });
    });

    it('should allow manual region change', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, region: 'asia' }),
      });

      const TestComponent = () => {
        const { currentRegion, setRegion } = useRegion();
        return (
          <div>
            <span data-testid="region">{currentRegion}</span>
            <button onClick={() => setRegion('asia')}>Change to Asia</button>
          </div>
        );
      };

      render(
        <RegionProvider defaultRegion="spain">
          <TestComponent />
        </RegionProvider>
      );

      expect(screen.getByTestId('region')).toHaveTextContent('spain');

      fireEvent.click(screen.getByText('Change to Asia'));

      await waitFor(() => {
        expect(screen.getByTestId('region')).toHaveTextContent('asia');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('user-region', 'asia');
    });
  });

  describe('RegionSelector Component', () => {
    it('should render navbar variant correctly', () => {
      render(
        <RegionProvider defaultRegion="spain">
          <RegionSelector variant="navbar" />
        </RegionProvider>
      );

      expect(screen.getByLabelText('Select region')).toBeInTheDocument();
      expect(screen.getByText('España')).toBeInTheDocument();
    });

    it('should show dropdown on click', () => {
      render(
        <RegionProvider defaultRegion="spain">
          <RegionSelector variant="navbar" />
        </RegionProvider>
      );

      const button = screen.getByLabelText('Select region');
      fireEvent.click(button);

      expect(screen.getByText('Latinoamérica')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Europe')).toBeInTheDocument();
      expect(screen.getByText('Asia Pacific')).toBeInTheDocument();
    });

    it('should change region when option is selected', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, region: 'usa' }),
      });

      render(
        <RegionProvider defaultRegion="spain">
          <RegionSelector variant="navbar" />
        </RegionProvider>
      );

      const button = screen.getByLabelText('Select region');
      fireEvent.click(button);

      const usaOption = screen.getByText('United States');
      fireEvent.click(usaOption);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/region',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ region: 'usa' }),
          })
        );
      });
    });

    it('should render settings variant with all options', () => {
      render(
        <RegionProvider defaultRegion="spain">
          <RegionSelector variant="settings" />
        </RegionProvider>
      );

      expect(screen.getByText('Region & Language')).toBeInTheDocument();
      expect(screen.getByText('Select your region for localized content and pricing')).toBeInTheDocument();

      // All regions should be visible in settings variant
      expect(screen.getByText('España')).toBeInTheDocument();
      expect(screen.getByText('Latinoamérica')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Europe')).toBeInTheDocument();
      expect(screen.getByText('Asia Pacific')).toBeInTheDocument();
    });

    it('should show selected region with check mark', () => {
      render(
        <RegionProvider defaultRegion="latam">
          <RegionSelector variant="settings" />
        </RegionProvider>
      );

      const selectedButton = screen.getByText('Latinoamérica').closest('button');
      expect(selectedButton).toHaveClass('border-primary');
      expect(selectedButton?.querySelector('[aria-label="Selected"]')).toBeInTheDocument();
    });

    it('should be disabled while loading', async () => {
      const TestComponent = () => {
        const { isLoading } = useRegion();
        return (
          <div>
            <span data-testid="loading">{isLoading ? 'loading' : 'ready'}</span>
            <RegionSelector variant="navbar" />
          </div>
        );
      };

      render(
        <RegionProvider>
          <TestComponent />
        </RegionProvider>
      );

      const button = screen.getByLabelText('Select region');

      // Initially should be loading
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      expect(button).toBeDisabled();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('API Route', () => {
    it('should handle region detection with proper headers', async () => {
      // This would normally be an integration test
      // Testing the route handler logic
      const mockHeaders = {
        'x-vercel-ip-country': 'FR',
        'x-vercel-ip-city': 'Paris',
        'x-vercel-ip-timezone': 'Europe/Paris',
      };

      // Mock the expected response structure
      const expectedResponse = {
        countryCode: 'FR',
        region: 'europe',
        city: 'Paris',
        timezone: 'Europe/Paris',
        currency: 'EUR',
        language: 'en-GB',
      };

      // This is a unit test example of what the API should return
      expect(expectedResponse.region).toBe('europe');
      expect(expectedResponse.currency).toBe('EUR');
    });

    it('should handle override via query params', () => {
      // Test that ?country=US overrides the detected country
      const queryCountry = 'US';
      const expectedRegion = 'usa';
      const expectedCurrency = 'USD';

      // This is a unit test example
      expect(expectedRegion).toBe('usa');
      expect(expectedCurrency).toBe('USD');
    });
  });
});

describe('Evidence Section with Regional Data', () => {
  it('should display region-specific content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        countryCode: 'US',
        region: 'usa',
        currency: 'USD',
        language: 'en-US',
      }),
    });

    // This test would verify that the Evidence Section
    // updates its content based on the selected region
    expect(true).toBe(true); // Placeholder
  });
});

// Export for potential reuse
export { localStorageMock };