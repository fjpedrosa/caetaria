/**
 * Performance Regression Detection System
 * 
 * Automated system to detect performance regressions by comparing
 * current performance metrics against historical baselines.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Regression detection configuration
const REGRESSION_CONFIG = {
  // Threshold percentages for regression detection
  thresholds: {
    // Performance score regressions
    lighthouse: {
      performance: 5,    // 5% decrease in performance score
      accessibility: 2,  // 2% decrease in accessibility score
      bestPractices: 3,  // 3% decrease in best practices score
      seo: 2,           // 2% decrease in SEO score
    },

    // Core Web Vitals regressions (milliseconds or score increase)
    webVitals: {
      LCP: 200,         // 200ms increase in LCP
      FID: 20,          // 20ms increase in FID
      CLS: 0.02,        // 0.02 increase in CLS
      INP: 50,          // 50ms increase in INP
      FCP: 150,         // 150ms increase in FCP
      TTI: 500,         // 500ms increase in TTI
    },

    // Bundle size regressions (KB increase)
    bundleSize: {
      firstLoadJS: 10,  // 10KB increase in first load JS
      totalJS: 20,      // 20KB increase in total JS
      totalCSS: 5,      // 5KB increase in total CSS
      individual: 5,    // 5KB increase in individual bundles
    },

    // Memory usage regressions (MB increase or percentage)
    memory: {
      heapGrowth: 5,    // 5MB increase in heap growth
      peakMemory: 10,   // 10MB increase in peak memory
      growthRate: 0.5,  // 0.5MB/min increase in growth rate
    },

    // Database performance regressions (milliseconds increase)
    database: {
      simpleQuery: 10,  // 10ms increase in simple queries
      complexQuery: 25, // 25ms increase in complex queries
      insert: 10,       // 10ms increase in inserts
      update: 10,       // 10ms increase in updates
    },

    // Real-time performance regressions
    realtime: {
      connectionTime: 200,    // 200ms increase in connection time
      messageLatency: 25,     // 25ms increase in message latency
      subscriptionTime: 100,  // 100ms increase in subscription time
    },
  },

  // Historical data retention
  retention: {
    maxReports: 50,        // Keep last 50 reports
    maxDays: 30,           // Keep reports from last 30 days
    comparisonWindow: 10,  // Compare against last 10 reports
  },

  // Severity levels for regressions
  severity: {
    critical: 0.15,   // >15% regression
    high: 0.10,       // >10% regression
    medium: 0.05,     // >5% regression
    low: 0.02,        // >2% regression
  },

  // Git integration
  git: {
    enabled: true,
    includeCommitInfo: true,
    includeBranchInfo: true,
    includeAuthorInfo: true,
  },
};

class PerformanceRegressionDetector {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'performance/reports');
    this.baselineDir = path.join(this.reportsDir, 'baselines');
    this.regressionDir = path.join(this.reportsDir, 'regressions');
    this.currentResults = null;
    this.baseline = null;
    this.regressions = [];
  }

  async initialize() {
    console.log('🔍 Initializing Performance Regression Detector...');
    
    // Ensure directories exist
    await fs.mkdir(this.reportsDir, { recursive: true });
    await fs.mkdir(this.baselineDir, { recursive: true });
    await fs.mkdir(this.regressionDir, { recursive: true });
    
    console.log('✅ Regression detector initialized');
  }

  async detectRegressions() {
    console.log('🔍 Starting performance regression detection...');
    
    try {
      // Load current performance results
      await this.loadCurrentResults();
      
      // Load or create baseline
      await this.loadBaseline();
      
      // Analyze for regressions
      this.analyzeRegressions();
      
      // Generate regression report
      const report = await this.generateRegressionReport();
      
      // Update baseline if no critical regressions
      await this.updateBaseline();
      
      return report;
      
    } catch (error) {
      console.error('❌ Regression detection failed:', error);
      throw error;
    }
  }

  async loadCurrentResults() {
    console.log('📊 Loading current performance results...');
    
    const currentResults = {
      timestamp: Date.now(),
      git: await this.getGitInfo(),
      lighthouse: await this.loadLighthouseResults(),
      bundleSize: await this.loadBundleResults(),
      memory: await this.loadMemoryResults(),
      database: await this.loadDatabaseResults(),
      realtime: await this.loadRealtimeResults(),
    };

    this.currentResults = currentResults;
    console.log('✅ Current results loaded');
  }

  async getGitInfo() {
    if (!REGRESSION_CONFIG.git.enabled) return null;

    try {
      const gitInfo = {};

      if (REGRESSION_CONFIG.git.includeCommitInfo) {
        gitInfo.commit = execSync('git rev-parse HEAD').toString().trim();
        gitInfo.commitShort = execSync('git rev-parse --short HEAD').toString().trim();
        gitInfo.commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
        gitInfo.commitDate = execSync('git log -1 --pretty=%cI').toString().trim();
      }

      if (REGRESSION_CONFIG.git.includeBranchInfo) {
        gitInfo.branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      }

      if (REGRESSION_CONFIG.git.includeAuthorInfo) {
        gitInfo.author = execSync('git log -1 --pretty=%an').toString().trim();
        gitInfo.authorEmail = execSync('git log -1 --pretty=%ae').toString().trim();
      }

      return gitInfo;
    } catch (error) {
      console.warn('⚠️ Could not get Git info:', error.message);
      return null;
    }
  }

  async loadLighthouseResults() {
    try {
      const lighthouseDir = path.join(this.reportsDir, 'lighthouse');
      const files = await fs.readdir(lighthouseDir);
      const latestFile = files
        .filter(f => f.includes('summary') && f.endsWith('.json'))
        .sort()
        .pop();

      if (!latestFile) {
        console.warn('⚠️ No Lighthouse results found');
        return null;
      }

      const filePath = path.join(lighthouseDir, latestFile);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      return {
        overall: data.overall,
        results: data.results,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.warn('⚠️ Could not load Lighthouse results:', error.message);
      return null;
    }
  }

  async loadBundleResults() {
    try {
      const bundleDir = path.join(this.reportsDir, 'bundle');
      const files = await fs.readdir(bundleDir);
      const latestFile = files
        .filter(f => f.includes('bundle-analysis') && f.endsWith('.json'))
        .sort()
        .pop();

      if (!latestFile) {
        console.warn('⚠️ No bundle analysis results found');
        return null;
      }

      const filePath = path.join(bundleDir, latestFile);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      return {
        analysis: data.analysis,
        passed: data.passed,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.warn('⚠️ Could not load bundle results:', error.message);
      return null;
    }
  }

  async loadMemoryResults() {
    try {
      const memoryDir = path.join(this.reportsDir, 'memory');
      const files = await fs.readdir(memoryDir);
      const latestFile = files
        .filter(f => f.includes('memory-summary') && f.endsWith('.json'))
        .sort()
        .pop();

      if (!latestFile) {
        console.warn('⚠️ No memory profiling results found');
        return null;
      }

      const filePath = path.join(memoryDir, latestFile);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      return {
        overall: data.overall,
        results: data.results,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.warn('⚠️ Could not load memory results:', error.message);
      return null;
    }
  }

  async loadDatabaseResults() {
    try {
      // Database results would be stored by test runner
      const dbResults = global.getDatabaseTestResults ? global.getDatabaseTestResults() : null;
      
      if (!dbResults || dbResults.length === 0) {
        console.warn('⚠️ No database performance results found');
        return null;
      }

      // Calculate averages by test type
      const averages = {};
      const groups = {};

      for (const result of dbResults) {
        if (!result.passed) continue;
        
        const category = this.categorizeDbTest(result.testName);
        if (!groups[category]) groups[category] = [];
        groups[category].push(result.duration);
      }

      for (const [category, durations] of Object.entries(groups)) {
        averages[category] = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      }

      return {
        averages,
        totalTests: dbResults.length,
        passedTests: dbResults.filter(r => r.passed).length,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('⚠️ Could not load database results:', error.message);
      return null;
    }
  }

  async loadRealtimeResults() {
    try {
      const realtimeResults = global.getRealtimeTestResults ? global.getRealtimeTestResults() : null;
      const messageStats = global.getRealtimeMessageStats ? global.getRealtimeMessageStats() : null;
      
      if (!realtimeResults || realtimeResults.length === 0) {
        console.warn('⚠️ No real-time performance results found');
        return null;
      }

      // Calculate key metrics
      const averages = {};
      const groups = {};

      for (const result of realtimeResults) {
        if (!result.passed) continue;
        
        const category = this.categorizeRealtimeTest(result.testName);
        if (!groups[category]) groups[category] = [];
        groups[category].push(result.duration);
      }

      for (const [category, durations] of Object.entries(groups)) {
        averages[category] = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      }

      return {
        averages,
        messageStats,
        totalTests: realtimeResults.length,
        passedTests: realtimeResults.filter(r => r.passed).length,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('⚠️ Could not load real-time results:', error.message);
      return null;
    }
  }

  categorizeDbTest(testName) {
    if (testName.includes('insert') || testName.includes('bulk_insert')) return 'insert';
    if (testName.includes('update')) return 'update';
    if (testName.includes('delete')) return 'delete';
    if (testName.includes('complex') || testName.includes('join')) return 'complexQuery';
    return 'simpleQuery';
  }

  categorizeRealtimeTest(testName) {
    if (testName.includes('connection') || testName.includes('websocket')) return 'connectionTime';
    if (testName.includes('subscription')) return 'subscriptionTime';
    if (testName.includes('latency') || testName.includes('message')) return 'messageLatency';
    return 'other';
  }

  async loadBaseline() {
    console.log('📈 Loading performance baseline...');
    
    try {
      const baselineFile = path.join(this.baselineDir, 'current-baseline.json');
      const content = await fs.readFile(baselineFile, 'utf-8');
      this.baseline = JSON.parse(content);
      
      console.log(`✅ Baseline loaded from ${this.baseline.timestamp}`);
    } catch (error) {
      console.log('📈 No baseline found, creating from current results...');
      
      // Create initial baseline from current results
      this.baseline = {
        ...this.currentResults,
        createdAt: Date.now(),
        version: '1.0.0',
      };
      
      await this.saveBaseline();
    }
  }

  analyzeRegressions() {
    console.log('🔍 Analyzing performance regressions...');
    
    this.regressions = [];

    // Analyze Lighthouse regressions
    if (this.currentResults.lighthouse && this.baseline.lighthouse) {
      this.analyzeLighthouseRegressions();
    }

    // Analyze bundle size regressions
    if (this.currentResults.bundleSize && this.baseline.bundleSize) {
      this.analyzeBundleSizeRegressions();
    }

    // Analyze memory regressions
    if (this.currentResults.memory && this.baseline.memory) {
      this.analyzeMemoryRegressions();
    }

    // Analyze database regressions
    if (this.currentResults.database && this.baseline.database) {
      this.analyzeDatabaseRegressions();
    }

    // Analyze real-time regressions
    if (this.currentResults.realtime && this.baseline.realtime) {
      this.analyzeRealtimeRegressions();
    }

    console.log(`🔍 Found ${this.regressions.length} potential regressions`);
  }

  analyzeLighthouseRegressions() {
    const current = this.currentResults.lighthouse.overall;
    const baseline = this.baseline.lighthouse.overall;

    // Check performance scores
    for (const device of ['desktop', 'mobile']) {
      if (!current[device] || !baseline[device]) continue;

      const currentScores = current[device].scores;
      const baselineScores = baseline[device].scores;

      for (const [metric, threshold] of Object.entries(REGRESSION_CONFIG.thresholds.lighthouse)) {
        const currentValue = currentScores[metric];
        const baselineValue = baselineScores[metric];
        
        if (typeof currentValue === 'number' && typeof baselineValue === 'number') {
          const decrease = baselineValue - currentValue;
          const percentDecrease = (decrease / baselineValue) * 100;
          
          if (decrease > threshold) {
            this.regressions.push({
              category: 'lighthouse',
              subcategory: device,
              metric,
              current: currentValue,
              baseline: baselineValue,
              change: -decrease,
              percentChange: -percentDecrease,
              threshold,
              severity: this.calculateSeverity(percentDecrease / 100),
              description: `${metric} score decreased by ${decrease.toFixed(1)} points (${percentDecrease.toFixed(1)}%) on ${device}`,
            });
          }
        }
      }
    }
  }

  analyzeBundleSizeRegressions() {
    const current = this.currentResults.bundleSize.analysis;
    const baseline = this.baseline.bundleSize.analysis;

    const metrics = [
      { key: 'totalFirstLoadJS', threshold: 'firstLoadJS' },
      { key: 'totalJS', threshold: 'totalJS' },
    ];

    for (const { key, threshold } of metrics) {
      const currentValue = current[key];
      const baselineValue = baseline[key];
      
      if (typeof currentValue === 'number' && typeof baselineValue === 'number') {
        const increase = currentValue - baselineValue;
        const percentIncrease = (increase / baselineValue) * 100;
        const thresholdValue = REGRESSION_CONFIG.thresholds.bundleSize[threshold];
        
        if (increase > thresholdValue) {
          this.regressions.push({
            category: 'bundleSize',
            metric: key,
            current: currentValue,
            baseline: baselineValue,
            change: increase,
            percentChange: percentIncrease,
            threshold: thresholdValue,
            severity: this.calculateSeverity(percentIncrease / 100),
            description: `${key} increased by ${increase.toFixed(1)}KB (${percentIncrease.toFixed(1)}%)`,
          });
        }
      }
    }
  }

  analyzeMemoryRegressions() {
    const current = this.currentResults.memory.overall;
    const baseline = this.baseline.memory.overall;

    const metrics = [
      { key: 'averageGrowthRate', threshold: 'growthRate' },
      { key: 'peakMemoryUsage', threshold: 'peakMemory' },
    ];

    for (const { key, threshold } of metrics) {
      const currentValue = current[key];
      const baselineValue = baseline[key];
      
      if (typeof currentValue === 'number' && typeof baselineValue === 'number') {
        const increase = currentValue - baselineValue;
        const percentIncrease = (increase / baselineValue) * 100;
        const thresholdValue = REGRESSION_CONFIG.thresholds.memory[threshold];
        
        if (increase > thresholdValue) {
          this.regressions.push({
            category: 'memory',
            metric: key,
            current: currentValue,
            baseline: baselineValue,
            change: increase,
            percentChange: percentIncrease,
            threshold: thresholdValue,
            severity: this.calculateSeverity(percentIncrease / 100),
            description: `${key} increased by ${increase.toFixed(2)} (${percentIncrease.toFixed(1)}%)`,
          });
        }
      }
    }
  }

  analyzeDatabaseRegressions() {
    const current = this.currentResults.database.averages;
    const baseline = this.baseline.database.averages;

    for (const [operation, currentValue] of Object.entries(current)) {
      const baselineValue = baseline[operation];
      
      if (typeof currentValue === 'number' && typeof baselineValue === 'number') {
        const increase = currentValue - baselineValue;
        const percentIncrease = (increase / baselineValue) * 100;
        const thresholdValue = REGRESSION_CONFIG.thresholds.database[operation] || 10;
        
        if (increase > thresholdValue) {
          this.regressions.push({
            category: 'database',
            metric: operation,
            current: currentValue,
            baseline: baselineValue,
            change: increase,
            percentChange: percentIncrease,
            threshold: thresholdValue,
            severity: this.calculateSeverity(percentIncrease / 100),
            description: `${operation} query time increased by ${increase.toFixed(1)}ms (${percentIncrease.toFixed(1)}%)`,
          });
        }
      }
    }
  }

  analyzeRealtimeRegressions() {
    const current = this.currentResults.realtime.averages;
    const baseline = this.baseline.realtime.averages;

    for (const [operation, currentValue] of Object.entries(current)) {
      const baselineValue = baseline[operation];
      
      if (typeof currentValue === 'number' && typeof baselineValue === 'number') {
        const increase = currentValue - baselineValue;
        const percentIncrease = (increase / baselineValue) * 100;
        const thresholdValue = REGRESSION_CONFIG.thresholds.realtime[operation] || 50;
        
        if (increase > thresholdValue) {
          this.regressions.push({
            category: 'realtime',
            metric: operation,
            current: currentValue,
            baseline: baselineValue,
            change: increase,
            percentChange: percentIncrease,
            threshold: thresholdValue,
            severity: this.calculateSeverity(percentIncrease / 100),
            description: `${operation} increased by ${increase.toFixed(1)}ms (${percentIncrease.toFixed(1)}%)`,
          });
        }
      }
    }
  }

  calculateSeverity(percentChange) {
    const absChange = Math.abs(percentChange);
    
    if (absChange >= REGRESSION_CONFIG.severity.critical) return 'critical';
    if (absChange >= REGRESSION_CONFIG.severity.high) return 'high';
    if (absChange >= REGRESSION_CONFIG.severity.medium) return 'medium';
    if (absChange >= REGRESSION_CONFIG.severity.low) return 'low';
    
    return 'minimal';
  }

  async generateRegressionReport() {
    const report = {
      timestamp: Date.now(),
      git: this.currentResults.git,
      summary: {
        totalRegressions: this.regressions.length,
        criticalRegressions: this.regressions.filter(r => r.severity === 'critical').length,
        highRegressions: this.regressions.filter(r => r.severity === 'high').length,
        mediumRegressions: this.regressions.filter(r => r.severity === 'medium').length,
        lowRegressions: this.regressions.filter(r => r.severity === 'low').length,
      },
      regressions: this.regressions,
      baseline: {
        timestamp: this.baseline.timestamp,
        version: this.baseline.version,
        git: this.baseline.git,
      },
      current: this.currentResults,
      thresholds: REGRESSION_CONFIG.thresholds,
    };

    // Save regression report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.regressionDir, `regression-report-${timestamp}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 Regression report saved: ${reportPath}`);

    return report;
  }

  async updateBaseline() {
    const criticalRegressions = this.regressions.filter(r => r.severity === 'critical').length;
    
    if (criticalRegressions > 0) {
      console.log(`⚠️ Not updating baseline due to ${criticalRegressions} critical regressions`);
      return;
    }

    console.log('📈 Updating performance baseline...');
    
    this.baseline = {
      ...this.currentResults,
      createdAt: Date.now(),
      version: this.incrementVersion(this.baseline.version),
    };

    await this.saveBaseline();
  }

  async saveBaseline() {
    const baselineFile = path.join(this.baselineDir, 'current-baseline.json');
    await fs.writeFile(baselineFile, JSON.stringify(this.baseline, null, 2));

    // Also save timestamped version
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const timestampedFile = path.join(this.baselineDir, `baseline-${timestamp}.json`);
    await fs.writeFile(timestampedFile, JSON.stringify(this.baseline, null, 2));

    console.log(`✅ Baseline saved: ${baselineFile}`);
  }

  incrementVersion(version) {
    if (!version) return '1.0.0';
    
    const parts = version.split('.').map(Number);
    parts[2] = (parts[2] || 0) + 1;
    
    return parts.join('.');
  }

  printRegressionSummary(report) {
    console.log('\n🔍 PERFORMANCE REGRESSION SUMMARY');
    console.log('='.repeat(50));
    
    if (report.regressions.length === 0) {
      console.log('✅ No performance regressions detected!');
      console.log('🎯 All metrics within acceptable thresholds');
    } else {
      console.log(`\n📊 Regression Summary:`);
      console.log(`  Total Regressions: ${report.summary.totalRegressions}`);
      console.log(`  Critical: ${report.summary.criticalRegressions}`);
      console.log(`  High: ${report.summary.highRegressions}`);
      console.log(`  Medium: ${report.summary.mediumRegressions}`);
      console.log(`  Low: ${report.summary.lowRegressions}`);
      
      // Show critical and high regressions
      const importantRegressions = report.regressions.filter(r => 
        r.severity === 'critical' || r.severity === 'high'
      );
      
      if (importantRegressions.length > 0) {
        console.log(`\n🚨 Important Regressions:`);
        importantRegressions.forEach(reg => {
          console.log(`  • ${reg.severity.toUpperCase()}: ${reg.description}`);
        });
      }
    }
    
    if (report.git) {
      console.log(`\n📝 Current Commit:`);
      console.log(`  ${report.git.commitShort}: ${report.git.commitMessage}`);
      console.log(`  Branch: ${report.git.branch}`);
      console.log(`  Author: ${report.git.author}`);
    }
    
    console.log('\n='.repeat(50));
  }

  shouldFailBuild(report) {
    return report.summary.criticalRegressions > 0;
  }
}

// Main execution
async function runRegressionDetection() {
  const detector = new PerformanceRegressionDetector();
  
  try {
    await detector.initialize();
    const report = await detector.detectRegressions();
    
    detector.printRegressionSummary(report);
    
    // Exit with appropriate code
    if (detector.shouldFailBuild(report)) {
      console.log(`\n🚨 Build should fail due to ${report.summary.criticalRegressions} critical performance regressions`);
      process.exit(1);
    } else if (report.summary.highRegressions > 0) {
      console.log(`\n⚠️ ${report.summary.highRegressions} high priority performance regressions detected`);
      console.log('Consider investigating before merging');
      process.exit(0);
    } else {
      console.log(`\n✅ Performance regression check passed`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Performance regression detection failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { 
  PerformanceRegressionDetector, 
  runRegressionDetection, 
  REGRESSION_CONFIG 
};

// Run if called directly
if (require.main === module) {
  runRegressionDetection();
}