/**
 * Memory Profiling and Leak Detection
 * 
 * Comprehensive memory analysis using Chrome DevTools Protocol
 * to detect memory leaks and optimize memory usage patterns.
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Memory profiling configuration
const MEMORY_CONFIG = {
  // Memory thresholds (MB)
  thresholds: {
    maxHeapSize: 50,        // Maximum heap growth in 1 hour session
    maxInitialLoad: 25,     // Maximum memory on initial load
    maxAfterNavigation: 30, // Maximum memory after navigation
    maxGCRetained: 10,      // Maximum memory retained after GC
    maxGrowthRate: 2,       // Maximum MB/minute growth rate
  },
  
  // Test scenarios
  scenarios: [
    {
      name: 'Initial Load',
      description: 'Memory usage on first page load',
      steps: [
        { action: 'goto', url: '/' },
        { action: 'wait', duration: 3000 },
        { action: 'measure' },
      ],
    },
    {
      name: 'Navigation Flow',
      description: 'Memory during typical user navigation',
      steps: [
        { action: 'goto', url: '/' },
        { action: 'wait', duration: 2000 },
        { action: 'goto', url: '/onboarding/business' },
        { action: 'wait', duration: 2000 },
        { action: 'goto', url: '/onboarding/integration' },
        { action: 'wait', duration: 2000 },
        { action: 'goto', url: '/onboarding/bot-setup' },
        { action: 'wait', duration: 2000 },
        { action: 'measure' },
      ],
    },
    {
      name: 'Heavy Interaction',
      description: 'Memory during intensive interactions',
      steps: [
        { action: 'goto', url: '/' },
        { action: 'wait', duration: 1000 },
        { action: 'scroll', distance: 1000 },
        { action: 'wait', duration: 500 },
        { action: 'scroll', distance: -1000 },
        { action: 'wait', duration: 500 },
        { action: 'click', selector: 'button' },
        { action: 'wait', duration: 1000 },
        { action: 'measure' },
      ],
    },
    {
      name: 'WhatsApp Simulator Stress',
      description: 'Memory usage during GIF export and simulation',
      steps: [
        { action: 'goto', url: '/' },
        { action: 'wait', duration: 2000 },
        { action: 'scrollTo', selector: '[data-testid="whatsapp-simulator"]' },
        { action: 'wait', duration: 3000 }, // Let simulator load
        { action: 'click', selector: '[data-testid="play-conversation"]' },
        { action: 'wait', duration: 5000 }, // Let conversation play
        { action: 'click', selector: '[data-testid="export-gif"]' },
        { action: 'wait', duration: 10000 }, // GIF export
        { action: 'measure' },
      ],
    },
    {
      name: 'Form Interactions',
      description: 'Memory during form submissions',
      steps: [
        { action: 'goto', url: '/' },
        { action: 'scrollTo', selector: '[data-testid="lead-form"]' },
        { action: 'type', selector: 'input[name="businessName"]', text: 'Memory Test Business' },
        { action: 'type', selector: 'input[name="email"]', text: 'memory-test@example.com' },
        { action: 'type', selector: 'input[name="phoneNumber"]', text: '+1234567890' },
        { action: 'click', selector: 'button[type="submit"]' },
        { action: 'wait', duration: 3000 },
        { action: 'measure' },
      ],
    },
    {
      name: 'Long Session',
      description: 'Extended session to detect memory leaks',
      steps: [
        { action: 'goto', url: '/' },
        { action: 'measure', label: 'session_start' },
        // Simulate 10 minutes of activity
        ...Array.from({ length: 20 }, (_, i) => [
          { action: 'scroll', distance: 500 },
          { action: 'wait', duration: 1000 },
          { action: 'scroll', distance: -500 },
          { action: 'wait', duration: 1000 },
          { action: 'goto', url: `/onboarding/${['business', 'integration', 'bot-setup'][i % 3]}` },
          { action: 'wait', duration: 2000 },
          { action: 'goto', url: '/' },
          { action: 'wait', duration: 1000 },
          ...(i % 5 === 0 ? [{ action: 'measure', label: `session_${i * 30}s` }] : []),
        ]).flat(),
        { action: 'measure', label: 'session_end' },
      ],
    },
  ],
  
  // Performance marks to track
  performanceMarks: [
    'initial-load',
    'navigation-complete',
    'form-submission',
    'gif-export-start',
    'gif-export-complete',
  ],
};

class MemoryProfiler {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.reportDir = path.join(process.cwd(), 'performance/reports/memory');
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🧠 Initializing Memory Profiler...');
    
    // Ensure report directory exists
    await fs.mkdir(this.reportDir, { recursive: true });
    
    // Launch browser with memory tracking enabled
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--enable-precise-memory-info',
        '--js-flags="--expose-gc --max-old-space-size=2048"',
      ],
    });
    
    this.page = await this.browser.newPage();
    
    // Enable runtime and heap profiler
    const client = await this.page.target().createCDPSession();
    await client.send('Runtime.enable');
    await client.send('HeapProfiler.enable');
    
    this.cdpSession = client;
    
    console.log('✅ Memory profiler initialized');
  }

  async runMemoryProfilingTests() {
    console.log(`🔍 Running ${MEMORY_CONFIG.scenarios.length} memory profiling scenarios...`);
    
    for (const scenario of MEMORY_CONFIG.scenarios) {
      console.log(`\n🧠 Running: ${scenario.name}`);
      console.log(`   ${scenario.description}`);
      
      try {
        const result = await this.runScenario(scenario);
        this.results.push(result);
        
        // Save detailed results
        await this.saveDetailedResults(scenario, result);
        
        // Print quick summary
        const memoryUsage = result.measurements[result.measurements.length - 1];
        const initialMemory = result.measurements[0];
        const growth = memoryUsage ? memoryUsage.heapUsed - initialMemory.heapUsed : 0;
        
        console.log(`   📊 Final heap: ${(memoryUsage?.heapUsed || 0).toFixed(1)}MB`);
        console.log(`   📈 Growth: ${growth.toFixed(1)}MB`);
        
        if (memoryUsage && memoryUsage.heapUsed > MEMORY_CONFIG.thresholds.maxHeapSize) {
          console.log(`   ⚠️ Exceeds threshold: ${MEMORY_CONFIG.thresholds.maxHeapSize}MB`);
        }
        
      } catch (error) {
        console.error(`❌ Scenario failed: ${error.message}`);
        this.results.push({
          scenario: scenario.name,
          error: error.message,
          timestamp: Date.now(),
        });
      }
    }
  }

  async runScenario(scenario) {
    const measurements = [];
    const performanceTimings = [];
    let initialMemory = null;
    
    // Take initial measurement
    const baseline = await this.measureMemory('baseline');
    measurements.push(baseline);
    initialMemory = baseline;
    
    // Execute scenario steps
    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      
      try {
        await this.executeStep(step, i);
        
        // Take measurement if requested or every few steps
        if (step.action === 'measure' || i % 10 === 0) {
          const measurement = await this.measureMemory(step.label || `step_${i}`);
          measurements.push(measurement);
        }
        
      } catch (stepError) {
        console.warn(`   ⚠️ Step ${i} failed: ${stepError.message}`);
        // Continue with other steps
      }
    }
    
    // Force garbage collection and take final measurement
    await this.forceGarbageCollection();
    const afterGC = await this.measureMemory('after_gc');
    measurements.push(afterGC);
    
    // Analyze memory patterns
    const analysis = this.analyzeMemoryPattern(measurements, scenario);
    
    return {
      scenario: scenario.name,
      description: scenario.description,
      measurements,
      analysis,
      performanceTimings,
      timestamp: Date.now(),
      duration: measurements[measurements.length - 1].timestamp - measurements[0].timestamp,
    };
  }

  async executeStep(step, stepIndex) {
    const startTime = Date.now();
    
    switch (step.action) {
      case 'goto':
        await this.page.goto(`${this.baseUrl}${step.url}`, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
        break;
        
      case 'wait':
        await this.page.waitForTimeout(step.duration);
        break;
        
      case 'scroll':
        await this.page.evaluate((distance) => {
          window.scrollBy(0, distance);
        }, step.distance);
        break;
        
      case 'scrollTo':
        await this.page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, step.selector);
        break;
        
      case 'click':
        const element = await this.page.$(step.selector);
        if (element) {
          await element.click();
        }
        break;
        
      case 'type':
        await this.page.type(step.selector, step.text);
        break;
        
      case 'measure':
        // Measurement handled by caller
        break;
        
      default:
        console.warn(`Unknown step action: ${step.action}`);
    }
    
    const duration = Date.now() - startTime;
    if (duration > 10000) { // Log slow steps
      console.log(`     ⏱️ Slow step ${stepIndex} (${step.action}): ${duration}ms`);
    }
  }

  async measureMemory(label = 'measurement') {
    try {
      // Get heap statistics
      const heapStats = await this.cdpSession.send('Runtime.getHeapUsage');
      
      // Get performance memory info if available
      const performanceMemory = await this.page.evaluate(() => {
        if (window.performance && window.performance.memory) {
          return {
            usedJSHeapSize: window.performance.memory.usedJSHeapSize,
            totalJSHeapSize: window.performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
          };
        }
        return null;
      });
      
      // Get DOM stats
      const domStats = await this.page.evaluate(() => ({
        nodeCount: document.querySelectorAll('*').length,
        eventListeners: getEventListeners ? Object.keys(getEventListeners(document)).length : 0,
      }));
      
      const measurement = {
        label,
        timestamp: Date.now(),
        heapUsed: heapStats.usedSize / (1024 * 1024), // Convert to MB
        heapTotal: heapStats.totalSize / (1024 * 1024),
        performanceMemory: performanceMemory ? {
          used: performanceMemory.usedJSHeapSize / (1024 * 1024),
          total: performanceMemory.totalJSHeapSize / (1024 * 1024),
          limit: performanceMemory.jsHeapSizeLimit / (1024 * 1024),
        } : null,
        domNodes: domStats.nodeCount,
        eventListeners: domStats.eventListeners,
      };
      
      return measurement;
      
    } catch (error) {
      console.warn(`Failed to measure memory: ${error.message}`);
      return {
        label,
        timestamp: Date.now(),
        error: error.message,
      };
    }
  }

  async forceGarbageCollection() {
    try {
      await this.cdpSession.send('Runtime.collectGarbage');
      await this.page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      // Wait for GC to complete
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.warn('Could not force garbage collection:', error.message);
    }
  }

  analyzeMemoryPattern(measurements, scenario) {
    const validMeasurements = measurements.filter(m => !m.error && m.heapUsed);
    
    if (validMeasurements.length < 2) {
      return { error: 'Insufficient valid measurements for analysis' };
    }
    
    const first = validMeasurements[0];
    const last = validMeasurements[validMeasurements.length - 1];
    const peak = validMeasurements.reduce((max, m) => m.heapUsed > max.heapUsed ? m : max);
    
    // Calculate growth metrics
    const totalGrowth = last.heapUsed - first.heapUsed;
    const duration = (last.timestamp - first.timestamp) / 1000 / 60; // minutes
    const growthRate = duration > 0 ? totalGrowth / duration : 0; // MB/minute
    
    // Find memory leaks (continuous growth without significant drops)
    const leakIndicators = this.detectMemoryLeaks(validMeasurements);
    
    // Check against thresholds
    const issues = [];
    const warnings = [];
    
    if (last.heapUsed > MEMORY_CONFIG.thresholds.maxHeapSize) {
      issues.push(`Final heap size ${last.heapUsed.toFixed(1)}MB exceeds threshold ${MEMORY_CONFIG.thresholds.maxHeapSize}MB`);
    }
    
    if (growthRate > MEMORY_CONFIG.thresholds.maxGrowthRate) {
      issues.push(`Growth rate ${growthRate.toFixed(2)}MB/min exceeds threshold ${MEMORY_CONFIG.thresholds.maxGrowthRate}MB/min`);
    }
    
    if (leakIndicators.possibleLeak) {
      warnings.push(`Possible memory leak detected: ${leakIndicators.description}`);
    }
    
    // Calculate retention after GC
    const afterGC = validMeasurements.find(m => m.label === 'after_gc');
    let retentionRate = null;
    if (afterGC) {
      retentionRate = (afterGC.heapUsed / peak.heapUsed) * 100;
      if (retentionRate > 80) {
        warnings.push(`High memory retention after GC: ${retentionRate.toFixed(1)}%`);
      }
    }
    
    return {
      summary: {
        initialHeap: first.heapUsed,
        finalHeap: last.heapUsed,
        peakHeap: peak.heapUsed,
        totalGrowth,
        growthRate,
        duration: duration * 60, // seconds
        retentionRate,
      },
      thresholds: {
        maxHeapSize: MEMORY_CONFIG.thresholds.maxHeapSize,
        maxGrowthRate: MEMORY_CONFIG.thresholds.maxGrowthRate,
      },
      leakIndicators,
      issues,
      warnings,
      passed: issues.length === 0,
      measurementCount: validMeasurements.length,
    };
  }

  detectMemoryLeaks(measurements) {
    if (measurements.length < 5) {
      return { possibleLeak: false, description: 'Too few measurements' };
    }
    
    // Look for continuous growth pattern
    let continuousGrowth = 0;
    let maxContinuousGrowth = 0;
    
    for (let i = 1; i < measurements.length; i++) {
      if (measurements[i].heapUsed > measurements[i - 1].heapUsed) {
        continuousGrowth++;
        maxContinuousGrowth = Math.max(maxContinuousGrowth, continuousGrowth);
      } else {
        continuousGrowth = 0;
      }
    }
    
    const continuousGrowthRatio = maxContinuousGrowth / measurements.length;
    
    // Look for lack of significant drops
    const drops = measurements.filter((m, i) => {
      if (i === 0) return false;
      const previousMax = Math.max(...measurements.slice(0, i).map(m => m.heapUsed));
      return m.heapUsed < previousMax * 0.9; // 10% drop considered significant
    });
    
    const hasSignificantDrops = drops.length > 0;
    
    // Determine if there's a possible leak
    const possibleLeak = continuousGrowthRatio > 0.6 && !hasSignificantDrops;
    
    let description = '';
    if (possibleLeak) {
      if (continuousGrowthRatio > 0.8) {
        description = 'Strong leak indicator: Memory continuously grows with no significant drops';
      } else {
        description = 'Moderate leak indicator: Memory shows sustained growth pattern';
      }
    } else if (continuousGrowthRatio > 0.4) {
      description = 'Minor concern: Some continuous growth detected but with memory releases';
    } else {
      description = 'Normal memory pattern: Growth with appropriate releases';
    }
    
    return {
      possibleLeak,
      description,
      continuousGrowthRatio,
      hasSignificantDrops,
      dropCount: drops.length,
    };
  }

  async saveDetailedResults(scenario, result) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `memory-${scenario.name.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.json`;
    const filepath = path.join(this.reportDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(result, null, 2));
  }

  generateSummaryReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalScenarios: MEMORY_CONFIG.scenarios.length,
      results: [],
      overall: {
        passed: 0,
        failed: 0,
        warnings: 0,
        totalMemoryGrowth: 0,
        averageGrowthRate: 0,
        peakMemoryUsage: 0,
      },
      issues: [],
      recommendations: [],
      thresholds: MEMORY_CONFIG.thresholds,
    };

    // Analyze all results
    for (const result of this.results) {
      if (result.error) {
        summary.overall.failed++;
        summary.issues.push({
          scenario: result.scenario,
          type: 'execution_error',
          description: result.error,
        });
        continue;
      }

      const scenarioSummary = {
        scenario: result.scenario,
        description: result.description,
        duration: result.duration,
        passed: result.analysis.passed,
        issues: result.analysis.issues,
        warnings: result.analysis.warnings,
        summary: result.analysis.summary,
        leakIndicators: result.analysis.leakIndicators,
      };

      summary.results.push(scenarioSummary);

      if (result.analysis.passed) {
        summary.overall.passed++;
      } else {
        summary.overall.failed++;
      }

      if (result.analysis.warnings.length > 0) {
        summary.overall.warnings++;
      }

      // Accumulate metrics
      if (result.analysis.summary) {
        summary.overall.totalMemoryGrowth += result.analysis.summary.totalGrowth || 0;
        summary.overall.averageGrowthRate += result.analysis.summary.growthRate || 0;
        summary.overall.peakMemoryUsage = Math.max(
          summary.overall.peakMemoryUsage,
          result.analysis.summary.peakHeap || 0
        );
      }

      // Collect issues and recommendations
      result.analysis.issues.forEach(issue => {
        summary.issues.push({
          scenario: result.scenario,
          type: 'threshold_exceeded',
          description: issue,
        });
      });

      result.analysis.warnings.forEach(warning => {
        summary.issues.push({
          scenario: result.scenario,
          type: 'warning',
          description: warning,
        });
      });
    }

    // Calculate averages
    const validResults = summary.results.filter(r => r.passed !== undefined);
    if (validResults.length > 0) {
      summary.overall.averageGrowthRate /= validResults.length;
    }

    // Generate recommendations
    summary.recommendations = this.generateRecommendations(summary);

    return summary;
  }

  generateRecommendations(summary) {
    const recommendations = [];
    
    // Memory growth recommendations
    if (summary.overall.averageGrowthRate > 1) {
      recommendations.push({
        priority: 'high',
        category: 'memory_growth',
        title: 'High Memory Growth Rate Detected',
        description: `Average growth rate of ${summary.overall.averageGrowthRate.toFixed(2)}MB/min exceeds healthy levels`,
        actions: [
          'Review event listener cleanup in React components',
          'Check for unresolved promises and intervals',
          'Implement proper cleanup in useEffect hooks',
          'Consider using React.memo for expensive components',
        ],
      });
    }
    
    // Peak memory recommendations
    if (summary.overall.peakMemoryUsage > 40) {
      recommendations.push({
        priority: 'medium',
        category: 'peak_memory',
        title: 'High Peak Memory Usage',
        description: `Peak memory usage of ${summary.overall.peakMemoryUsage.toFixed(1)}MB is concerning`,
        actions: [
          'Optimize large data structures and objects',
          'Implement lazy loading for heavy components',
          'Review GIF export memory optimization',
          'Consider chunking large operations',
        ],
      });
    }
    
    // Memory leak recommendations
    const leakScenarios = summary.results.filter(r => r.leakIndicators?.possibleLeak);
    if (leakScenarios.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'memory_leaks',
        title: 'Possible Memory Leaks Detected',
        description: `${leakScenarios.length} scenarios show potential memory leak patterns`,
        scenarios: leakScenarios.map(s => s.scenario),
        actions: [
          'Review cleanup in unmounting components',
          'Check for circular references in objects',
          'Implement proper disposal of WebSocket connections',
          'Review third-party library usage',
        ],
      });
    }
    
    // WhatsApp Simulator specific
    const simulatorResults = summary.results.find(r => r.scenario.includes('WhatsApp Simulator'));
    if (simulatorResults && !simulatorResults.passed) {
      recommendations.push({
        priority: 'medium',
        category: 'gif_export',
        title: 'GIF Export Memory Optimization',
        description: 'WhatsApp Simulator GIF export consumes excessive memory',
        actions: [
          'Implement progressive GIF generation',
          'Add memory cleanup between frames',
          'Consider reducing default quality settings',
          'Implement user-selectable quality options',
        ],
      });
    }
    
    return recommendations;
  }

  async saveSummaryReport(summary) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const summaryPath = path.join(this.reportDir, `memory-summary-${timestamp}.json`);
    const htmlPath = path.join(this.reportDir, `memory-summary-${timestamp}.html`);

    // Save JSON summary
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    // Generate HTML report
    const html = this.generateHTMLReport(summary);
    await fs.writeFile(htmlPath, html);

    console.log(`📊 Memory summary saved: ${summaryPath}`);
    console.log(`🌐 HTML report saved: ${htmlPath}`);

    return { summaryPath, htmlPath };
  }

  generateHTMLReport(summary) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Profiling Report - ${summary.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #007acc; }
        .passed { border-left-color: #28a745; }
        .failed { border-left-color: #dc3545; }
        .warning { border-left-color: #ffc107; }
        .metric { margin: 5px 0; }
        .recommendations { margin: 20px 0; }
        .recommendation { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .high { border-left: 4px solid #dc3545; }
        .medium { border-left: 4px solid #ffc107; }
        .scenario-results { margin-top: 30px; }
        .scenario-result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 6px; }
        .leak-indicator { background: #ffebee; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Memory Profiling Report</h1>
            <p>Generated: ${summary.timestamp}</p>
            <p>Base URL: ${summary.baseUrl}</p>
        </div>

        <div class="summary">
            <div class="card ${summary.overall.passed > summary.overall.failed ? 'passed' : 'failed'}">
                <h3>📊 Overall Results</h3>
                <div class="metric">Passed: ${summary.overall.passed}</div>
                <div class="metric">Failed: ${summary.overall.failed}</div>
                <div class="metric">Warnings: ${summary.overall.warnings}</div>
            </div>

            <div class="card">
                <h3>📈 Memory Metrics</h3>
                <div class="metric">Avg Growth Rate: ${summary.overall.averageGrowthRate.toFixed(2)} MB/min</div>
                <div class="metric">Peak Usage: ${summary.overall.peakMemoryUsage.toFixed(1)} MB</div>
                <div class="metric">Total Growth: ${summary.overall.totalMemoryGrowth.toFixed(1)} MB</div>
            </div>

            <div class="card">
                <h3>🎯 Thresholds</h3>
                <div class="metric">Max Heap: ${summary.thresholds.maxHeapSize} MB</div>
                <div class="metric">Max Growth: ${summary.thresholds.maxGrowthRate} MB/min</div>
                <div class="metric">Max Retained: ${summary.thresholds.maxGCRetained} MB</div>
            </div>
        </div>

        ${summary.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>💡 Recommendations</h2>
            ${summary.recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="scenario-results">
            <h2>📄 Scenario Results</h2>
            ${summary.results.map(result => `
                <div class="scenario-result">
                    <h3>${result.scenario} ${result.passed ? '✅' : '❌'}</h3>
                    <p>${result.description}</p>
                    
                    ${result.summary ? `
                    <div class="card">
                        <h4>📊 Memory Summary</h4>
                        <div class="metric">Initial: ${result.summary.initialHeap.toFixed(1)} MB</div>
                        <div class="metric">Final: ${result.summary.finalHeap.toFixed(1)} MB</div>
                        <div class="metric">Peak: ${result.summary.peakHeap.toFixed(1)} MB</div>
                        <div class="metric">Growth: ${result.summary.totalGrowth.toFixed(1)} MB</div>
                        <div class="metric">Rate: ${result.summary.growthRate.toFixed(2)} MB/min</div>
                    </div>
                    ` : ''}
                    
                    ${result.leakIndicators && result.leakIndicators.possibleLeak ? `
                    <div class="leak-indicator">
                        <strong>⚠️ Memory Leak Indicator:</strong> ${result.leakIndicators.description}
                    </div>
                    ` : ''}
                    
                    ${result.issues.length > 0 ? `
                    <div style="margin-top: 10px; color: #dc3545;">
                        <strong>Issues:</strong>
                        ${result.issues.map(issue => `<div>• ${issue}</div>`).join('')}
                    </div>
                    ` : ''}
                    
                    ${result.warnings.length > 0 ? `
                    <div style="margin-top: 10px; color: #ff8c00;">
                        <strong>Warnings:</strong>
                        ${result.warnings.map(warning => `<div>• ${warning}</div>`).join('')}
                    </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  printSummary(summary) {
    console.log('\n🧠 MEMORY PROFILING SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`\n📊 Overall Results:`);
    console.log(`  Passed: ${summary.overall.passed}/${summary.totalScenarios}`);
    console.log(`  Failed: ${summary.overall.failed}/${summary.totalScenarios}`);
    console.log(`  Warnings: ${summary.overall.warnings}`);
    
    console.log(`\n📈 Memory Metrics:`);
    console.log(`  Average Growth Rate: ${summary.overall.averageGrowthRate.toFixed(2)} MB/min`);
    console.log(`  Peak Memory Usage: ${summary.overall.peakMemoryUsage.toFixed(1)} MB`);
    console.log(`  Total Memory Growth: ${summary.overall.totalMemoryGrowth.toFixed(1)} MB`);
    
    const criticalIssues = summary.issues.filter(i => i.type !== 'warning');
    if (criticalIssues.length > 0) {
      console.log(`\n🚨 Critical Issues:`);
      criticalIssues.forEach(issue => {
        console.log(`  • ${issue.scenario}: ${issue.description}`);
      });
    }
    
    const highPriorityRecs = summary.recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecs.length > 0) {
      console.log(`\n💡 High Priority Recommendations:`);
      highPriorityRecs.forEach(rec => {
        console.log(`  • ${rec.title}`);
      });
    }
    
    console.log('\n='.repeat(50));
  }
}

// Main execution
async function runMemoryProfiling() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const profiler = new MemoryProfiler(baseUrl);
  
  try {
    await profiler.initialize();
    await profiler.runMemoryProfilingTests();
    
    const summary = profiler.generateSummaryReport();
    await profiler.saveSummaryReport(summary);
    
    profiler.printSummary(summary);
    
    // Exit with appropriate code
    const criticalIssues = summary.issues.filter(i => i.type !== 'warning').length;
    const memoryLeaks = summary.results.filter(r => r.leakIndicators?.possibleLeak).length;
    
    if (criticalIssues > 0 || memoryLeaks > 0) {
      console.log(`\n🚨 ${criticalIssues} critical memory issues and ${memoryLeaks} potential leaks detected`);
      process.exit(1);
    } else if (summary.overall.warnings > 0) {
      console.log(`\n⚠️ ${summary.overall.warnings} memory warnings detected`);
      process.exit(0);
    } else {
      console.log(`\n✅ All memory profiling tests passed`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Memory profiling failed:', error);
    process.exit(1);
  } finally {
    await profiler.cleanup();
  }
}

// Export for programmatic use
module.exports = { MemoryProfiler, runMemoryProfiling, MEMORY_CONFIG };

// Run if called directly
if (require.main === module) {
  runMemoryProfiling();
}