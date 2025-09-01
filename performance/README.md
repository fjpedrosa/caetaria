# Performance Testing Suite

Comprehensive performance testing suite for the WhatsApp Cloud Landing platform, ensuring optimal performance across all metrics and user scenarios.

## 🎯 Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms  
- **CLS (Cumulative Layout Shift)**: <0.1
- **INP (Interaction to Next Paint)**: <200ms

### API Performance
- **95th percentile response time**: <200ms
- **Database queries**: <50ms for common operations
- **Real-time message delivery**: <100ms latency

### Bundle Size Limits
- **First Load JS**: <200KB
- **Total JS**: <300KB
- **Total CSS**: <50KB

### Memory Usage
- **Maximum heap growth**: <50MB per hour session
- **Peak memory usage**: <100MB
- **Memory growth rate**: <2MB/minute

## 📋 Test Suites

### 1. Load Testing (`k6`)
**Location**: `performance/load-tests/`

Tests API endpoints under various load conditions:
- Light Load: 10 concurrent users
- Medium Load: 50 concurrent users ramping to 50
- Heavy Load: 100-200 concurrent users with spikes
- Stress Testing: Finding system breaking points

```bash
# Run specific load test scenarios
npm run test:performance:load
npm run test:performance:stress

# Individual scenarios
k6 run performance/load-tests/api-endpoints.js --scenario=light_load
k6 run performance/load-tests/stress-test.js --scenario=gradual_stress
```

**Key Metrics**:
- Request/response times (p95 <200ms)
- Error rates (<1%)
- Throughput (requests per second)
- Connection failures
- Memory/CPU pressure under load

### 2. Lighthouse Audits (`lighthouse`)
**Location**: `performance/lighthouse-ci/`

Automated Core Web Vitals and performance auditing:
- Desktop and mobile performance testing
- Accessibility compliance (WCAG 2.1 AA)
- SEO optimization checks
- Best practices validation
- Progressive Web App features

```bash
# Run Lighthouse performance audits
npm run test:performance:lighthouse

# Manual execution
node performance/lighthouse-ci/lighthouse-runner.js
```

**Pages Tested**:
- Landing page (/)
- Onboarding flows (/onboarding/*)
- Privacy/Terms pages

**Thresholds**:
- Performance Score: ≥90
- Accessibility Score: ≥95
- Best Practices: ≥90
- SEO Score: ≥90

### 3. Memory Profiling (`puppeteer`)
**Location**: `performance/memory-profiling/`

Comprehensive memory analysis and leak detection:
- Initial load memory usage
- Navigation flow memory patterns
- Heavy interaction scenarios
- WhatsApp Simulator memory usage (GIF export)
- Long session leak detection (10+ minutes)

```bash
# Run memory profiling tests
npm run test:performance:memory

# Manual execution  
node performance/memory-profiling/memory-profiler.js
```

**Test Scenarios**:
- Initial page load memory
- Navigation flow memory usage
- Form interaction patterns
- GIF export memory impact
- Extended session leak detection

### 4. Bundle Analysis (`webpack-bundle-analyzer`)
**Location**: `performance/bundle-analysis/`

Bundle size optimization and analysis:
- First Load JS analysis
- Code splitting effectiveness
- Dependency optimization opportunities
- Duplicate module detection
- Tree shaking verification

```bash
# Run bundle analysis
npm run test:performance:bundle

# Manual execution
node performance/bundle-analysis/bundle-analyzer.js
```

**Analysis Features**:
- Bundle size breakdown by route
- Large module identification
- Duplicate dependency detection
- Optimization recommendations
- Historical size tracking

### 5. Database Performance (`jest` + `supabase`)
**Location**: `performance/database-tests/`

Database query performance and optimization:
- Simple query performance (<50ms)
- Complex JOIN query optimization
- Insert/Update/Delete performance
- Bulk operation efficiency
- Index effectiveness validation

```bash
# Run database performance tests
npm run test:performance:database

# Manual execution via Jest
jest --testPathPattern=performance/database-tests
```

**Query Categories**:
- Simple SELECT queries
- Filtered queries with indexes
- Complex JOIN operations
- Aggregation queries (COUNT, SUM)
- CRUD operations performance

### 6. Real-time Performance (`jest` + `supabase`)
**Location**: `performance/real-time-tests/`

WebSocket and real-time subscription testing:
- Connection establishment time
- Message delivery latency
- Concurrent connection scaling
- Subscription management performance
- Error handling and recovery

```bash
# Run real-time performance tests
npm run test:performance:realtime

# Manual execution via Jest
jest --testPathPattern=performance/real-time-tests
```

**Real-time Scenarios**:
- Single/multiple WebSocket connections
- High-frequency message streams
- Concurrent subscription management
- Connection failure recovery
- Scale testing (100+ connections)

### 7. Regression Detection
**Location**: `performance/regression-detection/`

Automated performance regression detection:
- Baseline comparison against historical data
- Multi-metric regression analysis
- Git integration for commit tracking
- Severity-based alerting
- Automatic baseline updates

```bash
# Run regression detection
npm run test:performance:regression

# Manual execution
node performance/regression-detection/performance-regression-detector.js
```

**Regression Categories**:
- Lighthouse score decreases
- Bundle size increases
- Memory usage increases  
- Database query slowdowns
- Real-time latency increases

## 🚀 Test Runner

**Location**: `performance/test-runner.js`

Orchestrates all performance tests with multiple execution modes:

```bash
# Run all tests
npm run test:performance:full

# Essential tests only (CI/CD)
npm run test:performance:essential

# Quick performance check
npm run test:performance:quick

# CI-optimized test suite
npm run test:performance:ci
```

### Execution Modes

| Mode | Description | Tests | Parallel | Duration |
|------|-------------|-------|----------|----------|
| `full` | All performance tests | All | No | ~30-45min |
| `essential` | Required tests only | Required only | No | ~15-20min |
| `quick` | Quick performance check | Bundle, DB, Regression | Yes | ~5-10min |
| `ci` | CI/CD optimized | Critical subset | No | ~15-20min |
| `load` | Load testing focus | Load/Stress only | No | ~15-25min |

### Features

- **Automatic server management**: Starts/stops dev server as needed
- **Dependency resolution**: Handles test execution order
- **Fail-fast mode**: Stops on critical failures (CI mode)
- **Parallel execution**: Runs independent tests simultaneously
- **Comprehensive reporting**: JSON and HTML reports
- **Git integration**: Tracks performance by commit

## 📊 Monitoring Dashboard

**Location**: `performance/monitoring/performance-dashboard.js`

Real-time performance monitoring dashboard:

```bash
# Start performance dashboard
npm run test:performance:dashboard

# Access dashboard
open http://localhost:3001/dashboard
```

### Dashboard Features

- **Real-time metrics**: Live performance monitoring
- **Historical data**: 24-hour performance trends
- **Alert system**: Automatic threshold-based alerting
- **Export functionality**: CSV/JSON data export
- **Multiple views**: Current metrics, trends, alerts

### API Endpoints

- `GET /dashboard` - Main dashboard interface
- `GET /api/metrics` - Current performance metrics
- `GET /api/history` - Historical performance data
- `GET /api/alerts` - Active performance alerts
- `GET /api/reports` - Available performance reports
- `GET /api/export` - Export performance data

## 📈 Performance Reports

All performance tests generate detailed reports stored in `performance/reports/`:

```
performance/reports/
├── lighthouse/          # Lighthouse audit reports
├── bundle/             # Bundle analysis reports  
├── memory/             # Memory profiling reports
├── regressions/        # Regression detection reports
├── test-runs/          # Test execution reports
└── baselines/          # Performance baselines
```

### Report Types

- **JSON Reports**: Machine-readable performance data
- **HTML Reports**: Human-readable dashboards with charts
- **CSV Exports**: Data for external analysis
- **Baseline Data**: Historical performance references

## 🔧 Configuration

### Environment Variables

```bash
# Server configuration
BASE_URL=http://localhost:3000
PERFORMANCE_DASHBOARD_PORT=3001

# Supabase configuration  
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Test configuration
ANALYZE=true                    # Enable bundle analysis
NODE_ENV=production            # Production-like testing
UV_THREADPOOL_SIZE=12          # Performance optimization
```

### Performance Thresholds

Thresholds can be customized in each test suite's configuration:

```javascript
// Example: lighthouse-runner.js
const PERFORMANCE_CONFIG = {
  thresholds: {
    LCP: { good: 2500, needsImprovement: 4000 },
    FID: { good: 100, needsImprovement: 300 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
  },
  scores: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
  }
};
```

## 🚨 CI/CD Integration

### GitHub Actions Integration

```yaml
name: Performance Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run performance tests
        run: npm run test:performance:ci
      - name: Upload performance reports
        uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: performance/reports/
```

### Quality Gates

The performance tests enforce quality gates:

- **Critical failures**: Bundle size limits, Core Web Vitals
- **Build failures**: Database timeouts, memory leaks
- **Warnings**: Performance score decreases, minor regressions

## 🛠️ Development Workflow

### Adding New Performance Tests

1. **Choose appropriate test suite** (load, lighthouse, memory, etc.)
2. **Follow existing patterns** for configuration and reporting
3. **Update test runner** configuration if needed
4. **Add to CI/CD pipeline** for automated execution
5. **Document new metrics** and thresholds

### Performance Debugging

1. **Run specific test suite** to isolate issues
2. **Use dashboard** for real-time monitoring  
3. **Analyze reports** for detailed performance data
4. **Compare with baselines** using regression detection
5. **Profile memory usage** for leak investigation

### Best Practices

- **Run tests locally** before committing changes
- **Monitor performance trends** over time
- **Set realistic thresholds** based on user expectations  
- **Test on representative data** sizes and scenarios
- **Keep baselines updated** with legitimate improvements

## 🔍 Troubleshooting

### Common Issues

**Server startup failures**:
```bash
# Check port availability
lsof -i :3000

# Clean cache and restart
npm run dev:clean
```

**k6 command not found**:
```bash
# Install k6 (macOS)
brew install k6

# Install k6 (Linux)
sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
```

**Memory profiling timeout**:
```bash
# Increase timeout in memory-profiler.js
const MEMORY_CONFIG = {
  scenarios: [
    { timeout: 900000 } // 15 minutes
  ]
};
```

**Database connection issues**:
```bash
# Verify Supabase configuration
npm run supabase:status

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Performance Investigation

When performance issues are detected:

1. **Identify affected metrics** from test reports
2. **Correlate with recent changes** using Git integration
3. **Run focused test suites** for detailed analysis
4. **Use browser DevTools** for manual investigation
5. **Compare memory/bundle reports** for regressions

## 📚 Additional Resources

- [Core Web Vitals Documentation](https://web.dev/vitals/)
- [k6 Load Testing Guide](https://k6.io/docs/)
- [Lighthouse Performance Guide](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)

---

For questions or issues with the performance testing suite, please refer to this documentation or create an issue in the project repository.