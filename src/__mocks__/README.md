# Testing Infrastructure for Supabase Backend Integration

This directory contains a comprehensive testing infrastructure designed to support the WhatsApp Cloud Landing project's Supabase backend integration while maintaining strict coverage requirements.

## 🏗️ Architecture Overview

The testing infrastructure follows a tiered approach with three distinct testing levels:

### 1. **Unit Tests** (Full Mocking)
- **Purpose**: Fast, isolated tests with no external dependencies
- **Database**: Fully mocked Supabase client
- **Performance**: < 50ms per test
- **Coverage Requirements**: 95% (domain), 90% (application)

### 2. **Integration Tests** (Real Database)
- **Purpose**: Test actual database operations and business logic integration
- **Database**: Local Supabase instance with test data
- **Performance**: < 500ms per test
- **Coverage**: Business-critical paths and error scenarios

### 3. **E2E Tests** (Full System)
- **Purpose**: End-to-end user journeys with real browser and database
- **Database**: Isolated test environment with managed state
- **Tools**: Playwright + Database state management
- **Performance**: < 30s per test scenario

## 📁 Directory Structure

```
src/__mocks__/
├── supabase/                    # Supabase-specific mocks and setup
│   ├── setup.ts                 # Main mock configuration and factory
│   ├── global-setup.ts          # Jest global setup for database
│   ├── global-teardown.ts       # Jest global teardown and cleanup
│   └── integration-setup.ts     # Integration test utilities
├── test-data/                   # Test data factories and fixtures
│   └── factories.ts             # Data factory functions for all entities
├── test-utils/                  # Testing utilities and helpers
│   ├── performance-monitor.ts   # Performance monitoring for database queries
│   ├── e2e-database-manager.ts  # E2E database state management
│   └── coverage-reporter.ts     # Enhanced coverage reporting
└── README.md                    # This file
```

## 🚀 Quick Start

### Running Tests

```bash
# Unit tests (default) - fast, fully mocked
npm run test:unit

# Integration tests - with real database
npm run test:integration

# E2E tests - full browser automation
npm run test:e2e

# All tests in sequence
npm run test:all

# Performance-focused tests
npm run test:performance

# Supabase-specific tests
npm run test:supabase
```

### Coverage Reports

```bash
# Basic coverage with thresholds
npm run test:coverage

# Detailed coverage with HTML report
npm run test:coverage:detailed

# Quick coverage threshold check
npm run test:coverage:check
```

## 🧪 Test Levels in Detail

### Unit Tests Configuration

```typescript
// Automatic mock detection
import { createTestSupabaseClient } from '../__mocks__/supabase/setup';

// Client automatically mocked for unit tests
const repository = new LeadRepository(createTestSupabaseClient());

// All database calls return predictable mock responses
const lead = await repository.findById('test-id');
```

**Key Features:**
- Zero network calls
- Predictable responses
- Fast execution (< 50ms)
- Full error simulation
- Memory efficient

### Integration Tests Configuration

```typescript
// Real database with test data isolation
import { getTestClient, createTestEmail } from '../__mocks__/supabase/integration-setup';

const client = getTestClient(); // Real Supabase client
const email = createTestEmail('integration'); // Isolated test data
```

**Key Features:**
- Real database operations
- Automatic data cleanup
- Performance monitoring
- Transaction rollback support
- Concurrent test safety

### E2E Tests Configuration

```typescript
// Complete system testing with managed database state
import { E2EDatabaseManager } from '../__mocks__/test-utils/e2e-database-manager';

const dbManager = new E2EDatabaseManager();
await dbManager.seedBasicTestData();
// ... run Playwright tests
await dbManager.cleanup();
```

**Key Features:**
- Full user journey testing
- Database state management
- Performance monitoring
- Visual regression testing
- Cross-browser support

## 📊 Performance Monitoring

### Database Query Performance

```typescript
import { monitorSupabaseQuery, PERFORMANCE_THRESHOLDS } from '../__mocks__/test-utils/performance-monitor';

// Monitor individual queries
const result = await monitorSupabaseQuery(
  'create_lead',
  repository.create(leadData),
  PERFORMANCE_THRESHOLDS.INSERT_SINGLE
);

// Monitor batch operations
const results = await monitorBatchOperations(
  'bulk_insert',
  operations,
  PERFORMANCE_THRESHOLDS.INSERT_BATCH
);
```

### Performance Thresholds

| Operation Type | Threshold | Purpose |
|---|---|---|
| Simple SELECT | 100ms | Single table queries |
| Complex SELECT | 300ms | Joins and aggregations |
| Single INSERT | 50ms | Individual record creation |
| Batch INSERT | 200ms | Multiple record creation |
| UPDATE operations | 100ms | Record modifications |
| DELETE operations | 100ms | Record removal |

### Performance Assertions

```typescript
// Custom Jest matchers for performance
expect(measurement).toCompleteWithinThreshold(100);
expect(fastQuery).toBeFasterThan(slowQuery);
```

## 🏭 Test Data Factories

### Factory Usage

```typescript
import { createLeadFactory, createOnboardingScenario } from '../__mocks__/test-data/factories';

// Create individual records
const lead = createLeadFactory({
  email: 'custom@example.com',
  company_name: 'Custom Company'
});

// Create complex scenarios
const scenario = await createOnboardingScenario(client);
// Returns: { lead, session, activities }
```

### Available Factories

- **Marketing**: `createLeadFactory()`, `createLeadInteractionFactory()`
- **Onboarding**: `createOnboardingSessionFactory()`, `createStepActivityFactory()`
- **Analytics**: `createEventFactory()`, `createMetricFactory()`
- **Experiments**: `createExperimentFactory()`, `createExperimentAssignmentFactory()`

### Batch Operations

```typescript
// Create multiple records efficiently
const leads = createLeadBatch(10, { source: 'website-form' });
const events = createEventBatch(50, { type: 'page_view' });
```

## 📈 Coverage Requirements & Reporting

### Strict Coverage Thresholds

| Layer | Branches | Functions | Lines | Statements |
|---|---|---|---|---|
| **Domain** | 95% | 95% | 95% | 95% |
| **Application** | 90% | 90% | 90% | 90% |
| **Infrastructure** | 85% | 85% | 90% | 90% |
| **UI Components** | 80% | 80% | 85% | 85% |

### Enhanced Reporting

```typescript
import { CoverageAnalyzer } from '../__mocks__/test-utils/coverage-reporter';

const analyzer = new CoverageAnalyzer();
const report = await analyzer.analyzeCoverage('unit');

// Generate detailed HTML report
await analyzer.generateDetailedReport(report);

// Print console summary
analyzer.printConsoleSummary(report);
```

The coverage reporter provides:
- Module-level breakdown
- Layer-specific analysis
- Threshold compliance checking
- HTML and JSON reports
- CI/CD integration support

## 🔧 Environment Configuration

### Test Environment Variables

```bash
# Database Configuration
SUPABASE_TEST_URL=http://localhost:54321
SUPABASE_TEST_ANON_KEY=your_test_key

# Test Level Control
TEST_LEVEL=unit|integration|e2e

# Performance Monitoring
PERFORMANCE_MONITORING=true
```

### Database Setup for Integration Tests

```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Verify setup
supabase status

# Run integration tests
npm run test:integration
```

## 🎯 Best Practices

### 1. Test Isolation

```typescript
// ✅ Good - Isolated test data
const email = createTestEmail('specific_test');

// ❌ Bad - Shared test data
const email = 'test@example.com';
```

### 2. Performance Testing

```typescript
// ✅ Good - Monitor performance
const measurement = await performanceMonitor.measureAsync(
  'operation_name',
  () => operation()
);
expect(measurement).toCompleteWithinThreshold(100);

// ❌ Bad - No performance monitoring
await operation();
```

### 3. Data Cleanup

```typescript
// ✅ Good - Automatic cleanup with test run ID
const testData = withTestMetadata({ name: 'test' });

// ❌ Bad - Manual cleanup prone to leaks
const testData = { name: 'test' };
```

### 4. Error Scenarios

```typescript
// ✅ Good - Test both success and failure
it('should handle validation errors', async () => {
  await expect(invalidOperation()).rejects.toThrow('Validation failed');
});

// ❌ Bad - Only test happy path
it('should create record', async () => {
  const result = await validOperation();
  expect(result).toBeTruthy();
});
```

## 🚨 Common Issues & Solutions

### Integration Test Database Connection

**Problem**: Integration tests fail with "connection refused"

**Solution**:
```bash
# Ensure Supabase is running
supabase status

# Reset database if needed
supabase db reset

# Check environment variables
echo $SUPABASE_TEST_URL
```

### Test Data Leakage

**Problem**: Tests interfere with each other

**Solution**:
```typescript
// Use test run IDs for isolation
const email = createTestEmail('test_name');

// Clean up automatically
afterEach(async () => {
  await cleanupTestData(testRunId);
});
```

### Performance Test Failures

**Problem**: Tests occasionally fail performance thresholds

**Solution**:
```typescript
// Use appropriate thresholds for your environment
const threshold = process.env.CI ? 200 : 100;
expect(measurement).toCompleteWithinThreshold(threshold);

// Monitor trends, not just individual runs
logPerformanceReport('Test Suite Name');
```

### Coverage Threshold Failures

**Problem**: Coverage drops below required thresholds

**Solution**:
```bash
# Generate detailed report to identify gaps
npm run test:coverage:detailed

# Focus on domain and application layers first
npm run test:domain
npm run test:application

# Check specific modules
jest --testPathPattern=marketing/domain --coverage
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres:15.1.0.147
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      # Unit tests (fast)
      - run: npm run test:unit
      
      # Integration tests (with database)
      - run: |
          npm run supabase:start
          npm run test:integration
        env:
          SUPABASE_TEST_URL: http://localhost:54321
          
      # E2E tests
      - run: npx playwright install
      - run: npm run test:e2e
      
      # Coverage reporting
      - run: npm run test:coverage:detailed
      - uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
```

## 📚 Example Test Files

### Unit Test Example
- **File**: `src/modules/marketing/__tests__/infrastructure/supabase-lead-repository.test.ts`
- **Purpose**: Tests repository with full mocking
- **Features**: Error handling, performance assertions, edge cases

### Integration Test Example
- **File**: `src/modules/onboarding/__tests__/integration/onboarding-flow.integration.test.ts`
- **Purpose**: Tests complete business flow with real database
- **Features**: Multi-step processes, data consistency, concurrent operations

## 🤝 Contributing

### Adding New Tests

1. **Unit Tests**: Add to `__tests__/` directory with `.test.ts` suffix
2. **Integration Tests**: Add with `.integration.test.ts` suffix
3. **E2E Tests**: Add to `e2e/` directory with Playwright

### Extending Test Infrastructure

1. **New Factories**: Add to `test-data/factories.ts`
2. **New Utilities**: Add to `test-utils/` directory
3. **Performance Thresholds**: Update `performance-monitor.ts`

### Coverage Requirements

- **Domain Layer**: Must maintain 95% coverage
- **Application Layer**: Must maintain 90% coverage
- **New Features**: Must include comprehensive tests
- **Bug Fixes**: Must include regression tests

---

For questions or issues with the testing infrastructure, please refer to the test examples or create an issue in the project repository.