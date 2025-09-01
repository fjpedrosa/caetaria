/**
 * Performance Test Runner
 * 
 * Orchestrates all performance tests including load testing, lighthouse audits,
 * memory profiling, bundle analysis, and regression detection.
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Test runner configuration
const TEST_CONFIG = {
  // Test execution order and dependencies
  testSuites: [
    {
      name: 'Bundle Analysis',
      command: 'node performance/bundle-analysis/bundle-analyzer.js',
      timeout: 300000, // 5 minutes
      required: true,
      env: { NODE_ENV: 'production' },
      description: 'Analyzes bundle sizes and optimization opportunities',
    },
    {
      name: 'Lighthouse Audits',
      command: 'node performance/lighthouse-ci/lighthouse-runner.js',
      timeout: 600000, // 10 minutes
      required: true,
      env: { BASE_URL: 'http://localhost:3000' },
      description: 'Runs Core Web Vitals and performance audits',
      dependencies: ['server'], // Requires server to be running
    },
    {
      name: 'Memory Profiling',
      command: 'node performance/memory-profiling/memory-profiler.js',
      timeout: 900000, // 15 minutes
      required: false,
      env: { BASE_URL: 'http://localhost:3000' },
      description: 'Profiles memory usage and detects leaks',
      dependencies: ['server'],
    },
    {
      name: 'Database Performance',
      command: 'npm run test:performance:database',
      timeout: 300000, // 5 minutes
      required: true,
      env: {},
      description: 'Tests database query performance and optimization',
    },
    {
      name: 'Real-time Performance',
      command: 'npm run test:performance:realtime',
      timeout: 300000, // 5 minutes
      required: true,
      env: {},
      description: 'Tests WebSocket and real-time subscription performance',
    },
    {
      name: 'Load Testing (Light)',
      command: 'k6 run performance/load-tests/api-endpoints.js --scenario=light_load',
      timeout: 180000, // 3 minutes
      required: true,
      env: { BASE_URL: 'http://localhost:3000' },
      description: 'Light load testing of API endpoints',
      dependencies: ['server'],
    },
    {
      name: 'Load Testing (Medium)', 
      command: 'k6 run performance/load-tests/api-endpoints.js --scenario=medium_load',
      timeout: 300000, // 5 minutes
      required: false,
      env: { BASE_URL: 'http://localhost:3000' },
      description: 'Medium load testing of API endpoints',
      dependencies: ['server'],
    },
    {
      name: 'Stress Testing',
      command: 'k6 run performance/load-tests/stress-test.js --scenario=gradual_stress',
      timeout: 600000, // 10 minutes
      required: false,
      env: { BASE_URL: 'http://localhost:3000' },
      description: 'Stress testing to find system limits',
      dependencies: ['server'],
    },
    {
      name: 'Regression Detection',
      command: 'node performance/regression-detection/performance-regression-detector.js',
      timeout: 60000, // 1 minute
      required: true,
      env: {},
      description: 'Detects performance regressions against baseline',
    },
  ],

  // Execution modes
  modes: {
    full: {
      description: 'Run all performance tests',
      tests: 'all',
      parallel: false,
    },
    essential: {
      description: 'Run only required tests',
      tests: 'required',
      parallel: false,
    },
    quick: {
      description: 'Run quick performance checks',
      tests: ['Bundle Analysis', 'Database Performance', 'Regression Detection'],
      parallel: true,
    },
    ci: {
      description: 'CI/CD optimized test suite',
      tests: ['Bundle Analysis', 'Lighthouse Audits', 'Database Performance', 'Load Testing (Light)', 'Regression Detection'],
      parallel: false,
      failFast: true,
    },
    load: {
      description: 'Focus on load and stress testing',
      tests: ['Load Testing (Light)', 'Load Testing (Medium)', 'Stress Testing'],
      parallel: false,
    },
  },

  // Server management
  server: {
    command: 'npm run dev:stable',
    port: 3000,
    healthCheck: 'http://localhost:3000',
    startupTimeout: 60000, // 1 minute
    shutdownTimeout: 10000, // 10 seconds
  },

  // Reporting
  reporting: {
    outputDir: './performance/reports',
    generateHtml: true,
    generateJson: true,
    uploadResults: false,
  },
};

class PerformanceTestRunner {
  constructor(mode = 'essential') {
    this.mode = mode;
    this.config = TEST_CONFIG.modes[mode] || TEST_CONFIG.modes.essential;
    this.results = [];
    this.server = null;
    this.startTime = Date.now();
    this.reportDir = path.join(process.cwd(), 'performance/reports/test-runs');
  }

  async initialize() {
    console.log('🚀 Initializing Performance Test Runner...');
    console.log(`📋 Mode: ${this.mode} - ${this.config.description}`);
    
    // Ensure report directory exists
    await fs.mkdir(this.reportDir, { recursive: true });
    
    // Determine which tests to run
    this.testsToRun = this.getTestsToRun();
    
    console.log(`📊 Planning to run ${this.testsToRun.length} test suites:`);
    this.testsToRun.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.name} - ${test.description}`);
    });
    
    console.log('✅ Test runner initialized');
  }

  getTestsToRun() {
    if (this.config.tests === 'all') {
      return TEST_CONFIG.testSuites;
    } else if (this.config.tests === 'required') {
      return TEST_CONFIG.testSuites.filter(test => test.required);
    } else if (Array.isArray(this.config.tests)) {
      return TEST_CONFIG.testSuites.filter(test => 
        this.config.tests.includes(test.name)
      );
    }
    
    return TEST_CONFIG.testSuites;
  }

  async runTests() {
    console.log('\n🏁 Starting performance test execution...');
    
    try {
      // Start server if needed
      const needsServer = this.testsToRun.some(test => 
        test.dependencies && test.dependencies.includes('server')
      );
      
      if (needsServer) {
        await this.startServer();
      }
      
      // Run tests
      if (this.config.parallel && this.testsToRun.length > 1) {
        await this.runTestsInParallel();
      } else {
        await this.runTestsSequentially();
      }
      
      // Generate final report
      const report = await this.generateFinalReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    } finally {
      // Always cleanup
      await this.cleanup();
    }
  }

  async startServer() {
    console.log('\n🖥️ Starting development server...');
    
    return new Promise((resolve, reject) => {
      // Start the server process
      this.server = spawn('npm', ['run', 'dev:stable'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        detached: false,
        env: {
          ...process.env,
          PORT: TEST_CONFIG.server.port.toString(),
        },
      });

      let serverReady = false;
      let startupOutput = '';

      // Capture server output
      this.server.stdout.on('data', (data) => {
        const output = data.toString();
        startupOutput += output;
        
        // Check for server ready indicators
        if (output.includes('Ready') || output.includes('Local:') || output.includes('localhost:3000')) {
          if (!serverReady) {
            serverReady = true;
            console.log('✅ Development server started');
            
            // Wait a bit more for full initialization
            setTimeout(async () => {
              try {
                await this.healthCheckServer();
                resolve();
              } catch (error) {
                reject(error);
              }
            }, 5000);
          }
        }
      });

      this.server.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Error') || output.includes('Failed')) {
          console.warn('⚠️ Server error:', output);
        }
      });

      this.server.on('error', (error) => {
        reject(new Error(`Failed to start server: ${error.message}`));
      });

      // Timeout for server startup
      setTimeout(() => {
        if (!serverReady) {
          reject(new Error(`Server startup timeout after ${TEST_CONFIG.server.startupTimeout}ms`));
        }
      }, TEST_CONFIG.server.startupTimeout);
    });
  }

  async healthCheckServer() {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(TEST_CONFIG.server.healthCheck);
        if (response.ok) {
          console.log('✅ Server health check passed');
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Server health check failed');
  }

  async runTestsSequentially() {
    console.log('\n📋 Running tests sequentially...');
    
    for (let i = 0; i < this.testsToRun.length; i++) {
      const test = this.testsToRun[i];
      console.log(`\n[${i + 1}/${this.testsToRun.length}] ${test.name}`);
      console.log(`📝 ${test.description}`);
      
      try {
        const result = await this.runSingleTest(test);
        this.results.push(result);
        
        if (result.success) {
          console.log(`✅ ${test.name} completed successfully`);
        } else {
          console.log(`❌ ${test.name} failed: ${result.error}`);
          
          if (this.config.failFast) {
            console.log('🛑 Stopping execution due to fail-fast mode');
            break;
          }
        }
        
      } catch (error) {
        console.error(`❌ ${test.name} crashed:`, error.message);
        
        this.results.push({
          test: test.name,
          success: false,
          error: error.message,
          duration: 0,
          timestamp: Date.now(),
        });
        
        if (this.config.failFast) {
          console.log('🛑 Stopping execution due to fail-fast mode');
          break;
        }
      }
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async runTestsInParallel() {
    console.log('\n⚡ Running tests in parallel...');
    
    const promises = this.testsToRun.map(async (test, index) => {
      console.log(`[${index + 1}] Starting ${test.name}...`);
      
      try {
        const result = await this.runSingleTest(test);
        console.log(`✅ [${index + 1}] ${test.name} completed`);
        return result;
      } catch (error) {
        console.error(`❌ [${index + 1}] ${test.name} failed:`, error.message);
        return {
          test: test.name,
          success: false,
          error: error.message,
          duration: 0,
          timestamp: Date.now(),
        };
      }
    });

    this.results = await Promise.all(promises);
  }

  async runSingleTest(testConfig) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        ...testConfig.env,
      };

      // Parse command
      const [command, ...args] = testConfig.command.split(' ');
      
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        const result = {
          test: testConfig.name,
          success: code === 0,
          exitCode: code,
          duration,
          timestamp: startTime,
          stdout: stdout.slice(-5000), // Keep last 5KB of output
          stderr: stderr.slice(-2000), // Keep last 2KB of errors
        };

        if (code !== 0) {
          result.error = `Process exited with code ${code}`;
        }

        resolve(result);
      });

      child.on('error', (error) => {
        resolve({
          test: testConfig.name,
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
          timestamp: startTime,
        });
      });

      // Set timeout
      setTimeout(() => {
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 5000);
        
        resolve({
          test: testConfig.name,
          success: false,
          error: 'Test timeout',
          duration: Date.now() - startTime,
          timestamp: startTime,
        });
      }, testConfig.timeout);
    });
  }

  async generateFinalReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    const report = {
      mode: this.mode,
      timestamp: this.startTime,
      duration: totalDuration,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        successRate: this.results.length > 0 ? 
          (this.results.filter(r => r.success).length / this.results.length * 100).toFixed(1) : 0,
      },
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      },
      configuration: {
        mode: this.config,
        tests: this.testsToRun.map(t => ({
          name: t.name,
          required: t.required,
          timeout: t.timeout,
        })),
      },
    };

    // Save report
    const reportFile = await this.saveReport(report);
    
    // Print summary
    this.printSummary(report);
    
    return { report, reportFile };
  }

  async saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-test-run-${this.mode}-${timestamp}.json`;
    const filepath = path.join(this.reportDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    // Also generate HTML report if enabled
    if (TEST_CONFIG.reporting.generateHtml) {
      const htmlFile = filepath.replace('.json', '.html');
      const html = this.generateHtmlReport(report);
      await fs.writeFile(htmlFile, html);
      console.log(`📄 HTML report saved: ${htmlFile}`);
    }
    
    console.log(`📊 JSON report saved: ${filepath}`);
    return filepath;
  }

  generateHtmlReport(report) {
    const successTests = report.results.filter(r => r.success);
    const failedTests = report.results.filter(r => !r.success);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report - ${report.mode}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric { background: #f9f9f9; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007acc; }
        .metric-label { color: #666; margin-top: 5px; }
        .test-results { margin: 30px 0; }
        .test-result { margin: 15px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #ddd; }
        .test-success { background: #f0f8f0; border-left-color: #4caf50; }
        .test-failure { background: #fef5f5; border-left-color: #f44336; }
        .test-name { font-weight: bold; font-size: 1.1em; margin-bottom: 5px; }
        .test-duration { color: #666; font-size: 0.9em; }
        .test-error { background: #ffebee; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 0.8em; }
        .timestamp { color: #999; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Test Report</h1>
            <p>Mode: <strong>${report.mode}</strong> | Run: ${new Date(report.timestamp).toLocaleString()}</p>
            <p class="timestamp">Duration: ${(report.duration / 1000).toFixed(1)}s | Node.js ${report.environment.nodeVersion}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value">${report.summary.total}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #4caf50;">${report.summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #f44336;">${report.summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>

        <div class="test-results">
            <h2>📋 Test Results</h2>
            
            ${successTests.length > 0 ? `
            <h3 style="color: #4caf50;">✅ Passed Tests</h3>
            ${successTests.map(test => `
                <div class="test-result test-success">
                    <div class="test-name">${test.test}</div>
                    <div class="test-duration">Duration: ${(test.duration / 1000).toFixed(1)}s</div>
                </div>
            `).join('')}
            ` : ''}
            
            ${failedTests.length > 0 ? `
            <h3 style="color: #f44336;">❌ Failed Tests</h3>
            ${failedTests.map(test => `
                <div class="test-result test-failure">
                    <div class="test-name">${test.test}</div>
                    <div class="test-duration">Duration: ${(test.duration / 1000).toFixed(1)}s | Exit Code: ${test.exitCode || 'N/A'}</div>
                    ${test.error ? `<div class="test-error"><strong>Error:</strong> ${test.error}</div>` : ''}
                    ${test.stderr && test.stderr.trim() ? `<div class="test-error"><strong>Error Output:</strong><br><pre>${test.stderr.trim()}</pre></div>` : ''}
                </div>
            `).join('')}
            ` : ''}
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.8em;">
            Generated by Performance Test Runner | ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }

  printSummary(report) {
    console.log('\n🏁 PERFORMANCE TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Results:`);
    console.log(`  Mode: ${report.mode}`);
    console.log(`  Total Tests: ${report.summary.total}`);
    console.log(`  Passed: ${report.summary.passed}`);
    console.log(`  Failed: ${report.summary.failed}`);
    console.log(`  Success Rate: ${report.summary.successRate}%`);
    console.log(`  Total Duration: ${(report.duration / 1000).toFixed(1)}s`);
    
    if (report.summary.failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      const failedTests = report.results.filter(r => !r.success);
      failedTests.forEach(test => {
        console.log(`  • ${test.test}: ${test.error || 'Unknown error'}`);
      });
    }
    
    const slowTests = report.results
      .filter(r => r.success && r.duration > 60000) // Over 1 minute
      .sort((a, b) => b.duration - a.duration);
      
    if (slowTests.length > 0) {
      console.log(`\n⏱️ Slow Tests (>1min):`);
      slowTests.forEach(test => {
        console.log(`  • ${test.test}: ${(test.duration / 1000).toFixed(1)}s`);
      });
    }
    
    console.log('\n='.repeat(60));
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.server) {
      console.log('🛑 Stopping development server...');
      
      try {
        // Try graceful shutdown first
        this.server.kill('SIGTERM');
        
        // Force kill after timeout
        setTimeout(() => {
          if (this.server && !this.server.killed) {
            this.server.kill('SIGKILL');
          }
        }, TEST_CONFIG.server.shutdownTimeout);
        
        console.log('✅ Server stopped');
      } catch (error) {
        console.warn('⚠️ Error stopping server:', error.message);
      }
    }
    
    console.log('✅ Cleanup completed');
  }

  shouldFailBuild() {
    const criticalFailures = this.results.filter(r => 
      !r.success && this.testsToRun.find(t => t.name === r.test)?.required
    );
    
    return criticalFailures.length > 0;
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'essential';
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  
  if (args.includes('--list-modes')) {
    listModes();
    process.exit(0);
  }
  
  console.log('🚀 Performance Test Runner Starting...');
  console.log(`📋 Arguments: ${args.join(' ')}`);
  
  const runner = new PerformanceTestRunner(mode);
  
  try {
    await runner.initialize();
    const { report } = await runner.runTests();
    
    // Exit with appropriate code
    if (runner.shouldFailBuild()) {
      console.log(`\n🚨 Build should fail due to critical test failures`);
      process.exit(1);
    } else if (report.summary.failed > 0) {
      console.log(`\n⚠️ Some tests failed but build can continue`);
      process.exit(0);
    } else {
      console.log(`\n✅ All performance tests passed!`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Performance test runner failed:', error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
🚀 Performance Test Runner

Usage: node performance/test-runner.js [mode] [options]

Modes:
  full       - Run all performance tests (default)
  essential  - Run only required tests
  quick      - Run quick performance checks
  ci         - CI/CD optimized test suite  
  load       - Focus on load and stress testing

Options:
  --help, -h      - Show this help
  --list-modes    - List all available modes

Examples:
  node performance/test-runner.js essential
  node performance/test-runner.js ci
  node performance/test-runner.js full
`);
}

function listModes() {
  console.log('\n📋 Available Test Modes:\n');
  
  for (const [name, config] of Object.entries(TEST_CONFIG.modes)) {
    console.log(`${name.padEnd(12)} - ${config.description}`);
    
    const tests = typeof config.tests === 'string' ? config.tests : 
                 Array.isArray(config.tests) ? `${config.tests.length} specific tests` :
                 'custom selection';
    
    console.log(`${''.padEnd(15)}Tests: ${tests}`);
    console.log(`${''.padEnd(15)}Parallel: ${config.parallel ? 'Yes' : 'No'}`);
    
    if (config.failFast) {
      console.log(`${''.padEnd(15)}Fail Fast: Yes`);
    }
    
    console.log('');
  }
}

// Export for programmatic use
module.exports = { 
  PerformanceTestRunner, 
  TEST_CONFIG,
  main,
};

// Run if called directly
if (require.main === module) {
  main();
}