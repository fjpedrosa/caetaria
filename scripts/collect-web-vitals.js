#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.argv[2] || 'http://localhost:3000';
const OUTPUT_FILE = 'web-vitals-report.json';

const PAGES_TO_TEST = [
  '/',
  '/onboarding/business',
  '/onboarding/integration',
  '/onboarding/bot-setup',
  '/onboarding/testing',
  '/onboarding/verification',
  '/onboarding/complete',
];

const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTI: { good: 3800, needsImprovement: 7300 },
  TBT: { good: 200, needsImprovement: 600 },
};

async function collectWebVitals(page, url) {
  console.log(`Collecting Web Vitals for: ${url}`);
  
  // Navigate to the page
  await page.goto(url, { 
    waitUntil: 'networkidle0',
    timeout: 30000 
  });

  // Wait for the page to be fully interactive
  await page.waitForTimeout(3000);

  // Inject Web Vitals library
  await page.addScriptTag({
    url: 'https://unpkg.com/web-vitals@3/dist/web-vitals.umd.js'
  });

  // Collect Web Vitals metrics
  const vitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = {};
      let metricsCollected = 0;
      const totalMetrics = 6; // LCP, FID, CLS, FCP, TTI, TBT

      function onVital(metric) {
        vitals[metric.name] = {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
        };
        metricsCollected++;
        
        if (metricsCollected >= totalMetrics) {
          resolve(vitals);
        }
      }

      // Collect all Web Vitals
      webVitals.onLCP(onVital);
      webVitals.onFID(onVital);
      webVitals.onCLS(onVital);
      webVitals.onFCP(onVital);
      webVitals.onTTI(onVital);

      // For TBT, we need to calculate it manually
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let tbt = 0;
        
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            tbt += entry.duration - 50;
          }
        });
        
        vitals.TBT = {
          value: tbt,
          rating: tbt <= 200 ? 'good' : tbt <= 600 ? 'needs-improvement' : 'poor',
          delta: tbt,
        };
        metricsCollected++;
        
        if (metricsCollected >= totalMetrics) {
          resolve(vitals);
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });

      // Timeout after 10 seconds
      setTimeout(() => {
        resolve(vitals);
      }, 10000);
    });
  });

  return vitals;
}

async function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    targetUrl: TARGET_URL,
    summary: {
      totalPages: results.length,
      passedThresholds: 0,
      warnings: [],
      errors: [],
    },
    pages: results,
  };

  // Analyze results against thresholds
  results.forEach((pageResult) => {
    let pagePassed = true;
    
    Object.entries(pageResult.vitals).forEach(([metric, data]) => {
      if (!data || data.value === undefined) return;
      
      const threshold = THRESHOLDS[metric];
      if (!threshold) return;
      
      const value = data.value;
      const status = value <= threshold.good ? 'good' : 
                    value <= threshold.needsImprovement ? 'needs-improvement' : 'poor';
      
      data.status = status;
      data.threshold = threshold;
      
      if (status === 'poor') {
        pagePassed = false;
        report.summary.errors.push({
          page: pageResult.url,
          metric,
          value,
          threshold: threshold.needsImprovement,
          message: `${metric} value ${value} exceeds threshold ${threshold.needsImprovement}`
        });
      } else if (status === 'needs-improvement') {
        report.summary.warnings.push({
          page: pageResult.url,
          metric,
          value,
          threshold: threshold.good,
          message: `${metric} value ${value} needs improvement (good: <${threshold.good})`
        });
      }
    });
    
    if (pagePassed) {
      report.summary.passedThresholds++;
    }
  });

  // Save report to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
  
  // Output summary
  console.log('\n📊 Web Vitals Report Summary');
  console.log('═══════════════════════════');
  console.log(`📈 Pages tested: ${report.summary.totalPages}`);
  console.log(`✅ Pages passed: ${report.summary.passedThresholds}`);
  console.log(`⚠️  Warnings: ${report.summary.warnings.length}`);
  console.log(`❌ Errors: ${report.summary.errors.length}`);
  
  if (report.summary.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    report.summary.warnings.forEach((warning) => {
      console.log(`   ${warning.page}: ${warning.message}`);
    });
  }
  
  if (report.summary.errors.length > 0) {
    console.log('\n❌ Errors:');
    report.summary.errors.forEach((error) => {
      console.log(`   ${error.page}: ${error.message}`);
    });
  }
  
  console.log(`\n📁 Full report saved to: ${OUTPUT_FILE}`);
  
  // Exit with error code if there are errors
  if (report.summary.errors.length > 0) {
    process.exit(1);
  }
}

async function main() {
  console.log(`🚀 Starting Web Vitals collection for: ${TARGET_URL}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });

  const page = await browser.newPage();
  
  // Set viewport and user agent
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  const results = [];
  
  try {
    for (const pagePath of PAGES_TO_TEST) {
      const fullUrl = `${TARGET_URL}${pagePath}`;
      
      try {
        const vitals = await collectWebVitals(page, fullUrl);
        
        results.push({
          url: fullUrl,
          path: pagePath,
          vitals,
          timestamp: new Date().toISOString(),
        });
        
        console.log(`✅ Collected vitals for: ${pagePath}`);
        
        // Wait between pages to avoid overwhelming the server
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.error(`❌ Error collecting vitals for ${pagePath}:`, error.message);
        
        results.push({
          url: fullUrl,
          path: pagePath,
          vitals: null,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    await generateReport(results);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { collectWebVitals, generateReport };