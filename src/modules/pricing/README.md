# Pricing Module

This module implements pricing functionality following Clean Architecture principles with proper separation of concerns and SOLID principles.

## Architecture Overview

The module is organized into four main layers:

### 1. Domain Layer (`/domain`)
Contains pure business logic with no external dependencies:

- **Entities**: `PricingPlan`, `Discount` - Core business objects with behavior
- **Value Objects**: `Price`, `Currency` - Immutable objects representing domain concepts

**Key Features**:
- Support for 17 African currencies + major international currencies
- Flexible discount system (percentage and fixed amount)
- Business rules for pricing calculations and validations
- Immutable entities with pure transformation methods

### 2. Application Layer (`/application`)
Orchestrates business logic and defines contracts:

- **Use Cases**: `GetPricingPlans`, `CalculatePrice`, `ApplyDiscount`
- **Ports**: Repository interfaces for data access

**Key Features**:
- Complex price calculations with multiple factors
- Discount validation and application logic
- Billing period conversions (monthly/yearly)
- Quantity-based pricing

### 3. Infrastructure Layer (`/infra`)
Handles external dependencies and technical concerns:

- **Services**: `pricing-api.ts` - RTK Query API integration
- **Adapters**: Repository implementations using RTK Query

**Key Features**:
- RESTful API integration with proper error handling
- Type-safe API models with domain conversion
- Caching and state management via RTK Query
- Separation of API concerns from business logic

### 4. UI Layer (`/ui`)
React components for user interface:

- **Components**: `PricingTable`, `PriceCalculator`

**Key Features**:
- Responsive pricing table with plan comparison
- Interactive price calculator with discount support
- Real-time price updates and validation
- Accessible UI components using shadcn/ui

## Usage Examples

### Basic Pricing Table
```tsx
import { PricingTable } from './modules/pricing';

export function PricingPage() {
  const handlePlanSelect = (planId: string, billingPeriod: 'monthly' | 'yearly') => {
    console.log('Selected:', { planId, billingPeriod });
  };

  return (
    <PricingTable 
      onPlanSelect={handlePlanSelect}
      showComparison={true}
    />
  );
}
```

### Price Calculator
```tsx
import { PriceCalculator } from './modules/pricing';

export function CheckoutPage() {
  const handlePriceCalculated = (calculation: any) => {
    console.log('Calculated price:', calculation);
  };

  return (
    <PriceCalculator 
      onPriceCalculated={handlePriceCalculated}
      showQuantity={true}
      showDiscount={true}
    />
  );
}
```

### Direct Use Case Usage
```tsx
import { 
  GetPricingPlansUseCase,
  CalculatePriceUseCase,
  PricingRepositoryAdapter 
} from './modules/pricing';

// In a service or component
const pricingRepo = new PricingRepositoryAdapter(store);
const getPricingPlans = new GetPricingPlansUseCase(pricingRepo);

const result = await getPricingPlans.execute({ includeInactive: false });
if (result.isSuccess()) {
  console.log('Plans:', result.getValue().plans);
}
```

## API Endpoints

The module expects the following API endpoints:

- `GET /api/pricing/plans` - Get pricing plans with filtering
- `GET /api/pricing/plans/:id` - Get specific pricing plan
- `POST /api/pricing/calculate` - Calculate price with discounts
- `POST /api/pricing/discount/apply` - Apply discount code
- `GET /api/pricing/discount/validate` - Validate discount code
- `POST /api/pricing/discount/confirm` - Confirm discount usage
- `GET /api/pricing/discounts/active` - Get active discounts

## Supported Currencies

### International Currencies
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)

### African Currencies
- ZAR (South African Rand)
- NGN (Nigerian Naira)
- KES (Kenyan Shilling)
- GHS (Ghanaian Cedi)
- EGP (Egyptian Pound)
- MAD (Moroccan Dirham)
- TND (Tunisian Dinar)
- UGX (Ugandan Shilling)
- TZS (Tanzanian Shilling)
- ETB (Ethiopian Birr)
- ZMW (Zambian Kwacha)
- BWP (Botswana Pula)
- MUR (Mauritian Rupee)
- XOF (West African CFA Franc)
- XAF (Central African CFA Franc)

## Business Rules

### Pricing Plans
- Plans can be monthly or yearly billing
- Yearly plans automatically get 20% discount when converted from monthly
- Plans have features with optional usage limits
- Plans can be marked as popular for UI highlighting

### Discounts
- Two types: percentage and fixed amount
- Can have minimum purchase requirements
- Can have maximum discount caps
- Can be limited to specific plans
- Have validity date ranges and usage limits
- Currency must match for fixed amount discounts

### Price Calculations
- Support for quantity-based pricing
- Automatic currency validation
- Discount validation and application
- Billing period conversion with savings calculation

## Testing

The module is designed for easy testing with:
- Pure domain functions for unit testing
- Mockable repository interfaces
- Separated business logic from UI concerns
- Type-safe API contracts

## Dependencies

### External Dependencies
- `@reduxjs/toolkit` - State management and RTK Query
- `react` - UI components
- `lucide-react` - Icons

### Internal Dependencies
- `components/ui/*` - shadcn/ui components
- `store/api/base-api` - Base RTK Query configuration
- `modules/shared` - Shared domain objects (Result type)

## Future Enhancements

- Currency conversion support
- Tax calculation integration
- Subscription management
- Usage-based pricing models
- Advanced discount rules (buy X get Y free)
- A/B testing for pricing strategies