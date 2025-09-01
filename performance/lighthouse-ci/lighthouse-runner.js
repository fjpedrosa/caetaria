/**
 * Lighthouse CI Performance Runner
 * 
 * Automated Core Web Vitals and performance auditing using Lighthouse
 * for comprehensive page performance analysis.
 */

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Performance configuration
const PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds
  thresholds: {
    LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
    FID: { good: 100, needsImprovement: 300 },   // First Input Delay (ms)
    CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
    INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint (ms)
    FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)
    TTI: { good: 3800, needsImprovement: 7300 }, // Time to Interactive (ms)
    TBT: { good: 200, needsImprovement: 600 },   // Total Blocking Time (ms)
    SI: { good: 3400, needsImprovement: 5800 },  // Speed Index
  },
  
  // Performance score thresholds
  scores: {
    performance: 90,    // Minimum performance score
    accessibility: 95,  // Minimum accessibility score
    bestPractices: 90,  // Minimum best practices score
    seo: 90,           // Minimum SEO score
    pwa: 70,           // Minimum PWA score
  },

  // Bundle size thresholds (KB)
  bundleSize: {
    javascript: 300,    // Maximum JS bundle size
    css: 50,           // Maximum CSS bundle size
    total: 400,        // Maximum total bundle size
    firstLoad: 200,    // Maximum first load bundle size
  },
};

// Pages to test
const TEST_PAGES = [
  {
    name: 'Landing Page',
    url: '/',
    critical: true,
    expectedElements: ['hero-section', 'features-grid', 'cta-section'],
  },
  {
    name: 'Onboarding - Business Info',
    url: '/onboarding/business',
    critical: true,
    expectedElements: ['business-form', 'progress-indicator'],
  },
  {
    name: 'Onboarding - Integration',
    url: '/onboarding/integration',
    critical: true,
    expectedElements: ['integration-form', 'whatsapp-config'],
  },
  {
    name: 'Onboarding - Bot Setup',
    url: '/onboarding/bot-setup',
    critical: false,
    expectedElements: ['bot-configuration'],
  },
  {
    name: 'Onboarding - Testing',
    url: '/onboarding/testing',
    critical: false,
    expectedElements: ['test-conversation'],
  },
  {
    name: 'Onboarding - Complete',
    url: '/onboarding/complete',
    critical: false,
    expectedElements: ['completion-summary'],
  },
  {
    name: 'Privacy Policy',
    url: '/privacy',
    critical: false,
    expectedElements: ['privacy-content'],
  },
  {
    name: 'Terms of Service',
    url: '/terms',
    critical: false,
    expectedElements: ['terms-content'],
  },
];

// Lighthouse configuration
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-input-delay',
      'cumulative-layout-shift',
      'interaction-to-next-paint',
      'speed-index',
      'total-blocking-time',
      'time-to-interactive',
      'server-response-time',
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-responsive-images',
      'efficient-animated-content',
      'dom-size',
      'critical-request-chains',
      'user-timings',
      'bootup-time',
      'mainthread-work-breakdown',
      'diagnostics',
    ],
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240, // 10 Mbps
      cpuSlowdownMultiplier: 1,
    },
    emulatedFormFactor: 'desktop',
  },
};

const MOBILE_CONFIG = {
  ...LIGHTHOUSE_CONFIG,
  settings: {
    ...LIGHTHOUSE_CONFIG.settings,
    emulatedFormFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4, // Slow 3G
      cpuSlowdownMultiplier: 4,
    },
  },
};

class LighthouseRunner {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.reportDir = path.join(process.cwd(), 'performance/reports/lighthouse');
  }

  async initialize() {
    console.log('🏁 Initializing Lighthouse Performance Runner...');
    
    // Ensure report directory exists
    await fs.mkdir(this.reportDir, { recursive: true });
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
    });
    
    console.log('✅ Browser launched successfully');
  }

  async runPerformanceAudits() {
    console.log(`🔍 Running performance audits on ${TEST_PAGES.length} pages...`);
    
    for (const page of TEST_PAGES) {
      console.log(`\n📄 Testing: ${page.name} (${page.url})`);
      
      try {
        // Test both desktop and mobile
        const desktopResult = await this.auditPage(page, 'desktop', LIGHTHOUSE_CONFIG);
        const mobileResult = await this.auditPage(page, 'mobile', MOBILE_CONFIG);
        
        this.results.push({
          page,
          desktop: desktopResult,
          mobile: mobileResult,
          timestamp: new Date().toISOString(),
        });
        
        // Save individual reports
        await this.saveReport(page, desktopResult, 'desktop');
        await this.saveReport(page, mobileResult, 'mobile');
        
      } catch (error) {
        console.error(`❌ Error testing ${page.name}:`, error.message);
        this.results.push({
          page,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  async auditPage(page, device, config) {
    const url = `${this.baseUrl}${page.url}`;
    
    console.log(`  📱 ${device.toUpperCase()} audit: ${url}`);
    
    try {
      // Get a new page
      const browserPage = await this.browser.newPage();
      
      // Set viewport based on device
      if (device === 'mobile') {
        await browserPage.setViewport({ width: 375, height: 667 });
      } else {
        await browserPage.setViewport({ width: 1920, height: 1080 });
      }
      
      // Set user agent
      await browserPage.setUserAgent(
        device === 'mobile' 
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      
      const port = new URL(this.baseUrl).port;
      
      // Run Lighthouse audit
      const result = await lighthouse(url, {
        port: parseInt(port) || undefined,
        output: 'json',
        logLevel: 'error',
      }, config);
      
      await browserPage.close();
      
      // Extract key metrics
      const metrics = this.extractMetrics(result);
      const scores = this.extractScores(result);
      const diagnostics = this.extractDiagnostics(result);
      
      console.log(`    ⚡ Performance Score: ${scores.performance}/100`);
      console.log(`    🎯 LCP: ${metrics.LCP}ms, FID: ${metrics.FID}ms, CLS: ${metrics.CLS}`);
      
      return {
        metrics,
        scores,
        diagnostics,
        url,
        device,
        timestamp: Date.now(),
        rawResult: result,
      };
      
    } catch (error) {
      console.error(`    ❌ Audit failed:`, error.message);
      throw error;
    }
  }

  extractMetrics(result) {
    const audits = result.lhr.audits;
    
    return {
      LCP: audits['largest-contentful-paint']?.numericValue || 0,
      FID: audits['first-input-delay']?.numericValue || 0,
      FCP: audits['first-contentful-paint']?.numericValue || 0,
      CLS: audits['cumulative-layout-shift']?.numericValue || 0,
      INP: audits['interaction-to-next-paint']?.numericValue || 0,
      TTI: audits['time-to-interactive']?.numericValue || 0,
      TBT: audits['total-blocking-time']?.numericValue || 0,
      SI: audits['speed-index']?.numericValue || 0,
      TTFB: audits['server-response-time']?.numericValue || 0,
    };
  }

  extractScores(result) {
    const categories = result.lhr.categories;
    
    return {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      pwa: categories.pwa ? Math.round((categories.pwa?.score || 0) * 100) : null,
    };
  }

  extractDiagnostics(result) {
    const audits = result.lhr.audits;
    
    return {
      domSize: audits['dom-size']?.numericValue || 0,
      unusedCSS: audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
      unusedJS: audits['unused-javascript']?.details?.overallSavingsBytes || 0,
      renderBlocking: audits['render-blocking-resources']?.details?.overallSavingsMs || 0,
      imageOptimization: audits['uses-optimized-images']?.details?.overallSavingsBytes || 0,
      textCompression: audits['uses-text-compression']?.details?.overallSavingsBytes || 0,
    };
  }

  async saveReport(page, result, device) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${page.name.replace(/\s+/g, '-').toLowerCase()}-${device}-${timestamp}.json`;
    const filepath = path.join(this.reportDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(result, null, 2));
  }

  generateSummaryReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalPages: TEST_PAGES.length,
      criticalPages: TEST_PAGES.filter(p => p.critical).length,
      results: [],
      overall: {
        desktop: { passed: 0, failed: 0, scores: {} },
        mobile: { passed: 0, failed: 0, scores: {} },
      },
      failures: [],
      recommendations: [],
    };

    // Analyze results
    for (const result of this.results) {
      if (result.error) {
        summary.failures.push({
          page: result.page.name,
          error: result.error,
        });
        continue;
      }

      const pageResult = {
        page: result.page.name,
        url: result.page.url,
        critical: result.page.critical,
        desktop: this.evaluateResult(result.desktop),
        mobile: this.evaluateResult(result.mobile),
      };

      summary.results.push(pageResult);

      // Update overall stats
      if (pageResult.desktop.passed) summary.overall.desktop.passed++;
      else summary.overall.desktop.failed++;
      
      if (pageResult.mobile.passed) summary.overall.mobile.passed++;
      else summary.overall.mobile.failed++;

      // Collect recommendations
      summary.recommendations.push(...pageResult.desktop.recommendations);
      summary.recommendations.push(...pageResult.mobile.recommendations);
    }

    // Calculate average scores
    const desktopScores = this.results
      .filter(r => r.desktop)
      .map(r => r.desktop.scores);
    const mobileScores = this.results
      .filter(r => r.mobile)
      .map(r => r.mobile.scores);

    if (desktopScores.length > 0) {
      summary.overall.desktop.scores = this.calculateAverageScores(desktopScores);
    }
    if (mobileScores.length > 0) {
      summary.overall.mobile.scores = this.calculateAverageScores(mobileScores);
    }

    return summary;
  }

  evaluateResult(result) {
    if (!result) return { passed: false, issues: ['No result available'] };

    const issues = [];
    const recommendations = [];
    let passed = true;

    // Check Core Web Vitals
    Object.entries(PERFORMANCE_CONFIG.thresholds).forEach(([metric, thresholds]) => {
      const value = result.metrics[metric];
      if (value > thresholds.needsImprovement) {
        passed = false;
        issues.push(`${metric}: ${value} exceeds threshold ${thresholds.needsImprovement}`);
        recommendations.push(`Optimize ${metric} - current: ${value}, target: <${thresholds.good}`);
      }
    });

    // Check performance scores
    Object.entries(PERFORMANCE_CONFIG.scores).forEach(([category, threshold]) => {
      const score = result.scores[category];
      if (score && score < threshold) {
        passed = false;
        issues.push(`${category} score: ${score} below threshold ${threshold}`);
        recommendations.push(`Improve ${category} score - current: ${score}, target: ≥${threshold}`);
      }
    });

    // Check diagnostics
    if (result.diagnostics.unusedCSS > 50000) { // 50KB
      recommendations.push(`Remove unused CSS: ${Math.round(result.diagnostics.unusedCSS / 1024)}KB can be saved`);
    }
    if (result.diagnostics.unusedJS > 100000) { // 100KB
      recommendations.push(`Remove unused JavaScript: ${Math.round(result.diagnostics.unusedJS / 1024)}KB can be saved`);
    }
    if (result.diagnostics.renderBlocking > 500) { // 500ms
      recommendations.push(`Eliminate render-blocking resources: ${result.diagnostics.renderBlocking}ms delay`);
    }

    return {
      passed,
      issues,
      recommendations: [...new Set(recommendations)], // Remove duplicates
      metrics: result.metrics,
      scores: result.scores,
    };
  }

  calculateAverageScores(scoresArray) {
    const keys = Object.keys(scoresArray[0]);
    const averages = {};

    keys.forEach(key => {
      const values = scoresArray.map(scores => scores[key]).filter(v => v !== null);
      if (values.length > 0) {
        averages[key] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
    });

    return averages;
  }

  async saveSummaryReport(summary) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const summaryPath = path.join(this.reportDir, `summary-${timestamp}.json`);
    const htmlPath = path.join(this.reportDir, `summary-${timestamp}.html`);

    // Save JSON summary
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    // Generate HTML report
    const html = this.generateHTMLReport(summary);
    await fs.writeFile(htmlPath, html);

    console.log(`📊 Summary report saved: ${summaryPath}`);
    console.log(`🌐 HTML report saved: ${htmlPath}`);

    return { summaryPath, htmlPath };
  }

  generateHTMLReport(summary) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lighthouse Performance Report - ${summary.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .card { background: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #007acc; }
        .passed { border-left-color: #28a745; }
        .failed { border-left-color: #dc3545; }
        .metric { margin: 5px 0; }
        .score { font-weight: bold; font-size: 1.2em; }
        .good { color: #28a745; }
        .needs-improvement { color: #ffc107; }
        .poor { color: #dc3545; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .page-results { margin-top: 30px; }
        .page-result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 6px; }
        .device-results { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏁 Lighthouse Performance Report</h1>
            <p>Generated: ${summary.timestamp}</p>
            <p>Base URL: ${summary.baseUrl}</p>
        </div>

        <div class="summary">
            <div class="card ${summary.overall.desktop.passed > summary.overall.desktop.failed ? 'passed' : 'failed'}">
                <h3>📊 Desktop Performance</h3>
                <div class="metric">Passed: ${summary.overall.desktop.passed}/${summary.totalPages}</div>
                <div class="metric">Failed: ${summary.overall.desktop.failed}/${summary.totalPages}</div>
                ${summary.overall.desktop.scores.performance ? `<div class="score ${this.getScoreClass(summary.overall.desktop.scores.performance)}">Avg Performance: ${summary.overall.desktop.scores.performance}/100</div>` : ''}
            </div>

            <div class="card ${summary.overall.mobile.passed > summary.overall.mobile.failed ? 'passed' : 'failed'}">
                <h3>📱 Mobile Performance</h3>
                <div class="metric">Passed: ${summary.overall.mobile.passed}/${summary.totalPages}</div>
                <div class="metric">Failed: ${summary.overall.mobile.failed}/${summary.totalPages}</div>
                ${summary.overall.mobile.scores.performance ? `<div class="score ${this.getScoreClass(summary.overall.mobile.scores.performance)}">Avg Performance: ${summary.overall.mobile.scores.performance}/100</div>` : ''}
            </div>
        </div>

        ${summary.failures.length > 0 ? `
        <div class="recommendations">
            <h3>❌ Failed Pages</h3>
            ${summary.failures.map(f => `<div>• ${f.page}: ${f.error}</div>`).join('')}
        </div>
        ` : ''}

        <div class="page-results">
            <h2>📄 Individual Page Results</h2>
            ${summary.results.map(result => `
                <div class="page-result">
                    <h3>${result.page} ${result.critical ? '🔥 (Critical)' : ''}</h3>
                    <p><code>${result.url}</code></p>
                    
                    <div class="device-results">
                        <div class="card ${result.desktop.passed ? 'passed' : 'failed'}">
                            <h4>🖥️ Desktop</h4>
                            <div class="score ${this.getScoreClass(result.desktop.scores.performance)}">Performance: ${result.desktop.scores.performance}/100</div>
                            <div class="metric">LCP: ${Math.round(result.desktop.metrics.LCP)}ms</div>
                            <div class="metric">FID: ${Math.round(result.desktop.metrics.FID)}ms</div>
                            <div class="metric">CLS: ${result.desktop.metrics.CLS.toFixed(3)}</div>
                            ${result.desktop.issues.length > 0 ? `
                                <div style="margin-top: 10px; color: #dc3545;">
                                    <strong>Issues:</strong>
                                    ${result.desktop.issues.map(issue => `<div>• ${issue}</div>`).join('')}
                                </div>
                            ` : ''}
                        </div>

                        <div class="card ${result.mobile.passed ? 'passed' : 'failed'}">
                            <h4>📱 Mobile</h4>
                            <div class="score ${this.getScoreClass(result.mobile.scores.performance)}">Performance: ${result.mobile.scores.performance}/100</div>
                            <div class="metric">LCP: ${Math.round(result.mobile.metrics.LCP)}ms</div>
                            <div class="metric">FID: ${Math.round(result.mobile.metrics.FID)}ms</div>
                            <div class="metric">CLS: ${result.mobile.metrics.CLS.toFixed(3)}</div>
                            ${result.mobile.issues.length > 0 ? `
                                <div style="margin-top: 10px; color: #dc3545;">
                                    <strong>Issues:</strong>
                                    ${result.mobile.issues.map(issue => `<div>• ${issue}</div>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        ${summary.recommendations.length > 0 ? `
        <div class="recommendations">
            <h3>💡 Performance Recommendations</h3>
            ${[...new Set(summary.recommendations)].slice(0, 10).map(rec => `<div>• ${rec}</div>`).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }

  getScoreClass(score) {
    if (score >= 90) return 'good';
    if (score >= 70) return 'needs-improvement';
    return 'poor';
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  printSummary(summary) {
    console.log('\n📊 LIGHTHOUSE PERFORMANCE SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`\n🎯 Overall Results:`);
    console.log(`  Desktop: ${summary.overall.desktop.passed}/${summary.totalPages} passed`);
    console.log(`  Mobile:  ${summary.overall.mobile.passed}/${summary.totalPages} passed`);
    
    if (summary.overall.desktop.scores.performance) {
      console.log(`\n⚡ Average Performance Scores:`);
      console.log(`  Desktop: ${summary.overall.desktop.scores.performance}/100`);
      console.log(`  Mobile:  ${summary.overall.mobile.scores.performance}/100`);
    }
    
    if (summary.failures.length > 0) {
      console.log(`\n❌ Failed Pages:`);
      summary.failures.forEach(failure => {
        console.log(`  • ${failure.page}: ${failure.error}`);
      });
    }
    
    const criticalIssues = summary.results.filter(r => 
      r.critical && (!r.desktop.passed || !r.mobile.passed)
    );
    
    if (criticalIssues.length > 0) {
      console.log(`\n🔥 Critical Issues:`);
      criticalIssues.forEach(issue => {
        console.log(`  • ${issue.page}:`);
        if (!issue.desktop.passed) {
          console.log(`    Desktop: ${issue.desktop.issues.join(', ')}`);
        }
        if (!issue.mobile.passed) {
          console.log(`    Mobile: ${issue.mobile.issues.join(', ')}`);
        }
      });
    }
    
    console.log('\n='.repeat(50));
  }
}

// Main execution
async function runLighthouseAudits() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const runner = new LighthouseRunner(baseUrl);
  
  try {
    await runner.initialize();
    await runner.runPerformanceAudits();
    
    const summary = runner.generateSummaryReport();
    await runner.saveSummaryReport(summary);
    
    runner.printSummary(summary);
    
    // Exit with appropriate code
    const totalFailed = summary.overall.desktop.failed + summary.overall.mobile.failed;
    const criticalFailed = summary.results.filter(r => 
      r.critical && (!r.desktop.passed || !r.mobile.passed)
    ).length;
    
    if (criticalFailed > 0) {
      console.log(`\n🚨 ${criticalFailed} critical pages failed performance requirements`);
      process.exit(1);
    } else if (totalFailed > 0) {
      console.log(`\n⚠️ ${totalFailed} pages failed performance requirements`);
      process.exit(1);
    } else {
      console.log(`\n✅ All pages passed performance requirements`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// Export for programmatic use
module.exports = { LighthouseRunner, runLighthouseAudits, PERFORMANCE_CONFIG };

// Run if called directly
if (require.main === module) {
  runLighthouseAudits();
}