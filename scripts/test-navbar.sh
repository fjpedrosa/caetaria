#!/bin/bash

##
# Navbar Testing Suite
# 
# Comprehensive testing script for navbar component including:
# - E2E tests across browsers and devices
# - Performance and accessibility testing
# - Lighthouse CI audits
# - Visual regression testing
# - Memory and network performance
##

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_TIMEOUT=300000  # 5 minutes timeout
RETRY_COUNT=2
RESULTS_DIR="./test-results/navbar-$(date +%Y%m%d-%H%M%S)"
LIGHTHOUSE_DIR="./lighthouse-results/navbar-$(date +%Y%m%d-%H%M%S)"

# Create results directories
mkdir -p "$RESULTS_DIR"
mkdir -p "$LIGHTHOUSE_DIR"

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        error "npm is required but not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check if Playwright is installed
    if ! npm list @playwright/test &> /dev/null; then
        error "Playwright is not installed. Run: npm install"
        exit 1
    fi
    
    # Check if Lighthouse CI is available
    if ! npm list @lhci/cli &> /dev/null; then
        warning "Lighthouse CI not installed. Installing..."
        npm install --save-dev @lhci/cli
    fi
    
    success "All dependencies are available"
}

# Start development server
start_dev_server() {
    log "Starting development server..."
    
    # Check if server is already running
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log "Development server already running on port 3000"
        return 0
    fi
    
    # Start server in background
    npm run dev:stable > "$RESULTS_DIR/dev-server.log" 2>&1 &
    DEV_SERVER_PID=$!
    
    # Wait for server to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            success "Development server ready on port 3000"
            return 0
        fi
        
        log "Waiting for development server... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "Development server failed to start"
    exit 1
}

# Stop development server
stop_dev_server() {
    if [ ! -z "$DEV_SERVER_PID" ]; then
        log "Stopping development server (PID: $DEV_SERVER_PID)..."
        kill $DEV_SERVER_PID 2>/dev/null || true
        wait $DEV_SERVER_PID 2>/dev/null || true
    fi
}

# Install Playwright browsers if needed
install_browsers() {
    log "Ensuring Playwright browsers are installed..."
    npx playwright install --with-deps chromium firefox webkit
    success "Playwright browsers ready"
}

# Run E2E tests
run_e2e_tests() {
    log "Running E2E tests for navbar..."
    
    local test_files=(
        "e2e/navbar-e2e.spec.ts"
        "e2e/navbar-mobile.spec.ts"
        "e2e/navbar-accessibility.spec.ts"
    )
    
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            log "Running $test_file..."
            
            # Run with retry
            local attempt=1
            while [ $attempt -le $RETRY_COUNT ]; do
                if npx playwright test "$test_file" \
                    --timeout=$TEST_TIMEOUT \
                    --output-dir="$RESULTS_DIR/e2e" \
                    --reporter=html,json \
                    --reporter-options="outputDir=$RESULTS_DIR/reports"; then
                    success "✓ $test_file passed"
                    break
                else
                    warning "Attempt $attempt failed for $test_file"
                    attempt=$((attempt + 1))
                fi
            done
            
            if [ $attempt -gt $RETRY_COUNT ]; then
                error "✗ $test_file failed after $RETRY_COUNT attempts"
                FAILED_TESTS+=("$test_file")
            fi
        else
            warning "Test file $test_file not found, skipping"
        fi
    done
}

# Run performance tests
run_performance_tests() {
    log "Running performance tests for navbar..."
    
    local perf_test="e2e/navbar-performance.spec.ts"
    
    if [ -f "$perf_test" ]; then
        log "Running performance test suite..."
        
        if npx playwright test "$perf_test" \
            --project=performance \
            --timeout=$TEST_TIMEOUT \
            --output-dir="$RESULTS_DIR/performance" \
            --reporter=html,json; then
            success "✓ Performance tests passed"
        else
            error "✗ Performance tests failed"
            FAILED_TESTS+=("$perf_test")
        fi
    else
        warning "Performance test file not found"
    fi
}

# Run Lighthouse CI audits
run_lighthouse_audits() {
    log "Running Lighthouse CI audits..."
    
    # Desktop audit
    log "Running desktop Lighthouse audit..."
    if npx lhci autorun \
        --config=.lighthouserc.js \
        --upload.outputDir="$LIGHTHOUSE_DIR/desktop" \
        --collect.numberOfRuns=2; then
        success "✓ Desktop Lighthouse audit completed"
    else
        error "✗ Desktop Lighthouse audit failed"
        FAILED_TESTS+=("lighthouse-desktop")
    fi
    
    # Mobile audit (if mobile config exists)
    if grep -q "mobile:" .lighthouserc.js; then
        log "Running mobile Lighthouse audit..."
        if LHCI_BUILD_CONTEXT__CURRENT_BRANCH=mobile npx lhci autorun \
            --config=.lighthouserc.js \
            --upload.outputDir="$LIGHTHOUSE_DIR/mobile"; then
            success "✓ Mobile Lighthouse audit completed"
        else
            error "✗ Mobile Lighthouse audit failed"
            FAILED_TESTS+=("lighthouse-mobile")
        fi
    fi
}

# Run visual regression tests
run_visual_tests() {
    log "Running visual regression tests..."
    
    local visual_test="e2e/visual-regression.spec.ts"
    
    if [ -f "$visual_test" ]; then
        if npx playwright test "$visual_test" \
            --project=visual \
            --timeout=$TEST_TIMEOUT \
            --output-dir="$RESULTS_DIR/visual"; then
            success "✓ Visual regression tests passed"
        else
            error "✗ Visual regression tests failed"
            FAILED_TESTS+=("visual-regression")
        fi
    else
        warning "Visual regression test file not found"
    fi
}

# Run cross-browser tests
run_cross_browser_tests() {
    log "Running cross-browser tests..."
    
    local browsers=("chromium" "firefox" "webkit")
    
    for browser in "${browsers[@]}"; do
        log "Testing navbar on $browser..."
        
        if npx playwright test e2e/navbar-e2e.spec.ts \
            --project="$browser" \
            --timeout=$TEST_TIMEOUT \
            --output-dir="$RESULTS_DIR/browser-$browser"; then
            success "✓ $browser tests passed"
        else
            error "✗ $browser tests failed"
            FAILED_TESTS+=("browser-$browser")
        fi
    done
}

# Generate comprehensive report
generate_report() {
    log "Generating comprehensive test report..."
    
    local report_file="$RESULTS_DIR/navbar-test-report.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Navbar Test Report - $(date)</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; margin: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .failure { background: #f8d7da; border-color: #f5c6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        pre { background: #f1f3f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
        ul { list-style-type: none; padding-left: 0; }
        li { margin: 5px 0; padding: 5px; border-left: 3px solid #007bff; background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧭 Navbar Test Report</h1>
        <p>Generated: $(date)</p>
        <p>Test Suite: Comprehensive E2E, Performance, and Accessibility Testing</p>
    </div>
    
    <div class="section">
        <h2>📊 Test Summary</h2>
        <div class="metric">
            <strong>Total Tests:</strong> $((${#test_files[@]} + 3))
        </div>
        <div class="metric">
            <strong>Failed Tests:</strong> ${#FAILED_TESTS[@]}
        </div>
        <div class="metric">
            <strong>Success Rate:</strong> $(( (${#test_files[@]} + 3 - ${#FAILED_TESTS[@]}) * 100 / (${#test_files[@]} + 3) ))%
        </div>
    </div>
    
    <div class="section">
        <h2>🧪 Test Results</h2>
        <ul>
            <li>E2E Navigation Tests: $([ -z "${FAILED_TESTS[*]##*navbar-e2e*}" ] && echo "❌ FAILED" || echo "✅ PASSED")</li>
            <li>Mobile Interaction Tests: $([ -z "${FAILED_TESTS[*]##*navbar-mobile*}" ] && echo "❌ FAILED" || echo "✅ PASSED")</li>
            <li>Accessibility Tests: $([ -z "${FAILED_TESTS[*]##*navbar-accessibility*}" ] && echo "❌ FAILED" || echo "✅ PASSED")</li>
            <li>Performance Tests: $([ -z "${FAILED_TESTS[*]##*navbar-performance*}" ] && echo "❌ FAILED" || echo "✅ PASSED")</li>
            <li>Lighthouse Desktop: $([ -z "${FAILED_TESTS[*]##*lighthouse-desktop*}" ] && echo "❌ FAILED" || echo "✅ PASSED")</li>
            <li>Visual Regression: $([ -z "${FAILED_TESTS[*]##*visual-regression*}" ] && echo "❌ FAILED" || echo "✅ PASSED")</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>📁 Artifacts</h2>
        <ul>
            <li>Test Results: <code>$RESULTS_DIR</code></li>
            <li>Lighthouse Reports: <code>$LIGHTHOUSE_DIR</code></li>
            <li>Screenshots: <code>$RESULTS_DIR/test-results</code></li>
            <li>Performance Traces: <code>$RESULTS_DIR/traces</code></li>
        </ul>
    </div>
    
    <div class="section">
        <h2>🚀 Next Steps</h2>
        <p>Review failed tests and address any issues found. Focus on:</p>
        <ul>
            <li>Performance optimizations if Lighthouse scores are below thresholds</li>
            <li>Accessibility improvements if a11y tests failed</li>
            <li>Cross-browser compatibility issues</li>
            <li>Mobile responsiveness problems</li>
        </ul>
    </div>
</body>
</html>
EOF

    success "Test report generated: $report_file"
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    stop_dev_server
    
    # Archive results if successful
    if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
        log "Archiving successful test results..."
        tar -czf "navbar-tests-success-$(date +%Y%m%d-%H%M%S).tar.gz" "$RESULTS_DIR" "$LIGHTHOUSE_DIR" 2>/dev/null || true
    fi
}

# Main execution function
main() {
    log "🧭 Starting Navbar Test Suite"
    log "Results will be saved to: $RESULTS_DIR"
    
    # Initialize failed tests array
    FAILED_TESTS=()
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Execute test suite
    check_dependencies
    install_browsers
    start_dev_server
    
    # Run all test suites
    run_e2e_tests
    run_performance_tests
    run_lighthouse_audits
    run_visual_tests
    run_cross_browser_tests
    
    # Generate report
    generate_report
    
    # Print summary
    echo
    log "🎯 Navbar Test Suite Complete"
    
    if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
        success "All tests passed! 🎉"
        echo -e "${GREEN}✅ Navbar is ready for production${NC}"
    else
        error "Some tests failed:"
        for failed_test in "${FAILED_TESTS[@]}"; do
            echo -e "  ${RED}✗${NC} $failed_test"
        done
        echo -e "${RED}❌ Please review and fix failing tests${NC}"
        exit 1
    fi
    
    log "Test artifacts available in: $RESULTS_DIR"
    log "Lighthouse reports available in: $LIGHTHOUSE_DIR"
}

# Script options
case "${1:-}" in
    --help|-h)
        echo "Navbar Testing Suite"
        echo
        echo "Usage: $0 [options]"
        echo
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --e2e-only          Run only E2E tests"
        echo "  --performance-only  Run only performance tests"
        echo "  --lighthouse-only   Run only Lighthouse audits"
        echo "  --quick             Run quick test suite (no visual regression)"
        echo
        exit 0
        ;;
    --e2e-only)
        check_dependencies
        install_browsers
        start_dev_server
        run_e2e_tests
        ;;
    --performance-only)
        check_dependencies
        install_browsers
        start_dev_server
        run_performance_tests
        ;;
    --lighthouse-only)
        check_dependencies
        start_dev_server
        run_lighthouse_audits
        ;;
    --quick)
        check_dependencies
        install_browsers
        start_dev_server
        run_e2e_tests
        run_performance_tests
        generate_report
        ;;
    *)
        main
        ;;
esac