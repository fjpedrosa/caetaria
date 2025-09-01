// Components (Presentational)
export * from './components/price-calculator';
export * from './components/pricing-table';

// Containers (Smart Components)
export * from './containers/price-calculator-container';

// Re-export container as default PriceCalculator for backward compatibility
export { default as PriceCalculator } from './containers/price-calculator-container';