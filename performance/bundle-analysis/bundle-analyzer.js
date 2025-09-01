/**
 * Bundle Size Analysis and Optimization
 * 
 * Comprehensive bundle analysis to optimize loading performance
 * and ensure bundle sizes meet performance targets.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Bundle analysis configuration
const BUNDLE_CONFIG = {
  // Size thresholds (KB)
  thresholds: {
    firstLoadJS: 200,      // First Load JS bundle size
    totalJS: 300,          // Total JS bundle size  
    totalCSS: 50,          // Total CSS bundle size
    individual: 100,       // Individual chunk size
    gzipped: {
      firstLoadJS: 100,    // Gzipped first load JS
      totalJS: 150,        // Gzipped total JS
      totalCSS: 25,        // Gzipped CSS
    },
  },
  
  // Critical files that must be optimized
  criticalFiles: [
    'pages/_app',
    'pages/index',
    'chunks/framework',
    'chunks/main',
    'chunks/webpack',
  ],
  
  // Files to analyze for optimization opportunities  
  optimizationTargets: [
    'node_modules',
    'pages',
    'components', 
    'modules',
    'lib',
  ],
  
  // Expected bundle patterns
  expectedBundles: {
    'pages/_app': { maxSize: 50, critical: true },
    'pages/index': { maxSize: 30, critical: true },
    'chunks/framework': { maxSize: 80, critical: true },
    'chunks/main': { maxSize: 25, critical: true },
    'chunks/webpack': { maxSize: 10, critical: true },
  },
};

class BundleAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      bundles: [],
      analysis: {},
      recommendations: [],
      passed: false,
    };
    this.reportDir = path.join(process.cwd(), 'performance/reports/bundle');
  }

  async initialize() {
    console.log('📦 Initializing Bundle Analyzer...');
    
    // Ensure report directory exists
    await fs.mkdir(this.reportDir, { recursive: true });
    
    console.log('✅ Bundle analyzer initialized');
  }

  async analyzeBundles() {
    console.log('🔍 Analyzing bundle sizes...');
    
    try {
      // Build the project with bundle analysis
      await this.buildWithAnalysis();
      
      // Parse bundle analysis results
      await this.parseBundleReport();
      
      // Analyze individual bundles
      await this.analyzeIndividualBundles();
      
      // Generate optimization recommendations
      this.generateRecommendations();
      
      // Check against thresholds
      this.evaluateThresholds();
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      this.results.error = error.message;
      throw error;
    }
  }

  async buildWithAnalysis() {
    console.log('🏗️ Building project with bundle analysis...');
    
    try {
      // Clean previous builds
      await execAsync('npm run clean:cache');
      
      // Build with analysis
      const { stdout, stderr } = await execAsync('npm run build:analyze', {
        timeout: 300000, // 5 minutes timeout
        env: {
          ...process.env,
          ANALYZE: 'true',
          NODE_ENV: 'production',
        },
      });
      
      console.log('✅ Build completed successfully');
      
      // Parse build output for bundle information
      this.parseBuildOutput(stdout);
      
      if (stderr) {
        console.warn('⚠️ Build warnings:', stderr);
      }
      
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        throw new Error('Build timeout - bundle analysis taking too long');
      }
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  parseBuildOutput(buildOutput) {
    console.log('📊 Parsing build output...');
    
    // Extract bundle information from Next.js build output
    const lines = buildOutput.split('\n');
    let inBundleSection = false;
    
    for (const line of lines) {
      // Detect bundle analysis section
      if (line.includes('Page') && line.includes('Size') && line.includes('First Load JS')) {
        inBundleSection = true;
        continue;
      }
      
      if (inBundleSection && line.trim() === '') {
        inBundleSection = false;
        continue;
      }
      
      if (inBundleSection) {
        const bundleInfo = this.parseBundleLine(line);
        if (bundleInfo) {
          this.results.bundles.push(bundleInfo);
        }
      }
      
      // Extract summary information
      if (line.includes('First Load JS shared by all')) {
        const match = line.match(/(\d+(?:\.\d+)?)\s*kB/);
        if (match) {
          this.results.analysis.sharedJS = parseFloat(match[1]);
        }
      }
    }
  }

  parseBundleLine(line) {
    // Parse Next.js bundle analysis line format
    // Example: "┌ ○ /                              3.21 kB        85.2 kB"
    const bundleRegex = /[├┌└│]\s*([○●λ])\s*([\/\w\-\[\]]+)\s+(\d+(?:\.\d+)?)\s*([kK]B)\s+(\d+(?:\.\d+)?)\s*([kK]B)/;
    const match = line.match(bundleRegex);
    
    if (match) {
      const [, type, route, size, sizeUnit, firstLoadSize, firstLoadUnit] = match;
      
      return {
        route: route.trim(),
        type: this.getBundleType(type),
        size: parseFloat(size),
        sizeUnit: sizeUnit.toLowerCase(),
        firstLoadSize: parseFloat(firstLoadSize),
        firstLoadUnit: firstLoadUnit.toLowerCase(),
        sizeKB: sizeUnit.toLowerCase() === 'kb' ? parseFloat(size) : parseFloat(size) / 1024,
        firstLoadKB: firstLoadUnit.toLowerCase() === 'kb' ? parseFloat(firstLoadSize) : parseFloat(firstLoadSize) / 1024,
      };
    }
    
    return null;
  }

  getBundleType(symbol) {
    switch (symbol) {
      case '○': return 'static';
      case '●': return 'ssr';
      case 'λ': return 'server';
      default: return 'unknown';
    }
  }

  async parseBundleReport() {
    console.log('📋 Looking for detailed bundle report...');
    
    try {
      // Check for webpack-bundle-analyzer output
      const analyzeDir = path.join(process.cwd(), '.next/analyze');
      
      try {
        const files = await fs.readdir(analyzeDir);
        const reportFiles = files.filter(f => f.endsWith('.json') && f.includes('bundle'));
        
        for (const file of reportFiles) {
          const filePath = path.join(analyzeDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const bundleData = JSON.parse(content);
          
          this.results.analysis.webpackStats = bundleData;
          console.log(`📊 Loaded detailed bundle analysis: ${file}`);
        }
      } catch (dirError) {
        console.log('ℹ️ No detailed bundle analysis directory found');
      }
      
    } catch (error) {
      console.warn('⚠️ Could not parse detailed bundle report:', error.message);
    }
  }

  async analyzeIndividualBundles() {
    console.log('🔍 Analyzing individual bundles...');
    
    const analysis = {
      totalBundles: this.results.bundles.length,
      staticPages: this.results.bundles.filter(b => b.type === 'static').length,
      serverPages: this.results.bundles.filter(b => b.type === 'server').length,
      ssrPages: this.results.bundles.filter(b => b.type === 'ssr').length,
      totalJS: 0,
      totalFirstLoadJS: 0,
      largestBundle: null,
      smallestBundle: null,
      criticalBundles: [],
      oversizedBundles: [],
      optimizationOpportunities: [],
    };
    
    // Calculate totals and find extremes
    for (const bundle of this.results.bundles) {
      analysis.totalJS += bundle.sizeKB;
      analysis.totalFirstLoadJS += bundle.firstLoadKB;
      
      if (!analysis.largestBundle || bundle.sizeKB > analysis.largestBundle.sizeKB) {
        analysis.largestBundle = bundle;
      }
      
      if (!analysis.smallestBundle || bundle.sizeKB < analysis.smallestBundle.sizeKB) {
        analysis.smallestBundle = bundle;
      }
      
      // Check if bundle is critical
      if (this.isCriticalBundle(bundle.route)) {
        analysis.criticalBundles.push(bundle);
      }
      
      // Check if bundle is oversized
      const threshold = BUNDLE_CONFIG.expectedBundles[bundle.route]?.maxSize || 
                       BUNDLE_CONFIG.thresholds.individual;
      
      if (bundle.sizeKB > threshold) {
        analysis.oversizedBundles.push({
          ...bundle,
          threshold,
          excess: bundle.sizeKB - threshold,
        });
      }
    }
    
    // Analyze webpack stats if available
    if (this.results.analysis.webpackStats) {
      analysis.webpackAnalysis = this.analyzeWebpackStats(this.results.analysis.webpackStats);
    }
    
    this.results.analysis = { ...this.results.analysis, ...analysis };
  }

  analyzeWebpackStats(stats) {
    console.log('⚙️ Analyzing webpack statistics...');
    
    const analysis = {
      chunks: [],
      modules: [],
      assets: [],
      duplicateModules: [],
      largeModules: [],
      unusedModules: [],
    };
    
    try {
      // Analyze chunks
      if (stats.chunks) {
        analysis.chunks = stats.chunks.map(chunk => ({
          id: chunk.id,
          names: chunk.names,
          size: chunk.size,
          modules: chunk.modules ? chunk.modules.length : 0,
          files: chunk.files,
        }));
      }
      
      // Analyze modules
      if (stats.modules) {
        analysis.modules = stats.modules
          .map(module => ({
            name: module.name,
            size: module.size,
            chunks: module.chunks,
            reasons: module.reasons ? module.reasons.length : 0,
          }))
          .sort((a, b) => b.size - a.size);
        
        // Find large modules (>10KB)
        analysis.largeModules = analysis.modules.filter(m => m.size > 10240);
        
        // Find potential duplicate modules
        const moduleNames = {};
        for (const module of analysis.modules) {
          const name = module.name.split('?')[0]; // Remove query params
          if (!moduleNames[name]) {
            moduleNames[name] = [];
          }
          moduleNames[name].push(module);
        }
        
        analysis.duplicateModules = Object.entries(moduleNames)
          .filter(([name, modules]) => modules.length > 1)
          .map(([name, modules]) => ({
            name,
            instances: modules.length,
            totalSize: modules.reduce((sum, m) => sum + m.size, 0),
            modules,
          }));
      }
      
      // Analyze assets
      if (stats.assets) {
        analysis.assets = stats.assets
          .map(asset => ({
            name: asset.name,
            size: asset.size,
            chunks: asset.chunks,
          }))
          .sort((a, b) => b.size - a.size);
      }
      
    } catch (error) {
      console.warn('⚠️ Error analyzing webpack stats:', error.message);
    }
    
    return analysis;
  }

  isCriticalBundle(route) {
    return BUNDLE_CONFIG.criticalFiles.some(critical => 
      route.includes(critical) || critical.includes(route)
    );
  }

  generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');
    
    const recommendations = [];
    const analysis = this.results.analysis;
    
    // Bundle size recommendations
    if (analysis.totalFirstLoadJS > BUNDLE_CONFIG.thresholds.firstLoadJS) {
      recommendations.push({
        priority: 'high',
        category: 'bundle_size',
        title: 'Reduce First Load JS Bundle Size',
        description: `First Load JS (${analysis.totalFirstLoadJS.toFixed(1)}KB) exceeds threshold (${BUNDLE_CONFIG.thresholds.firstLoadJS}KB)`,
        impact: 'Critical for Core Web Vitals (LCP, FCP)',
        actions: [
          'Implement code splitting with dynamic imports',
          'Move non-critical code to separate chunks',
          'Optimize shared framework bundle',
          'Remove unused dependencies',
        ],
        estimatedSavings: `${(analysis.totalFirstLoadJS - BUNDLE_CONFIG.thresholds.firstLoadJS).toFixed(1)}KB`,
      });
    }
    
    // Oversized bundles
    if (analysis.oversizedBundles.length > 0) {
      const totalExcess = analysis.oversizedBundles.reduce((sum, b) => sum + b.excess, 0);
      
      recommendations.push({
        priority: 'medium',
        category: 'individual_bundles',
        title: 'Optimize Oversized Individual Bundles',
        description: `${analysis.oversizedBundles.length} bundles exceed size thresholds`,
        impact: 'Improves page load performance',
        bundles: analysis.oversizedBundles.map(b => `${b.route} (${b.sizeKB.toFixed(1)}KB > ${b.threshold}KB)`),
        actions: [
          'Split large pages into smaller components',
          'Implement lazy loading for heavy components',
          'Review and optimize imports',
          'Consider route-based code splitting',
        ],
        estimatedSavings: `${totalExcess.toFixed(1)}KB`,
      });
    }
    
    // Webpack-specific recommendations
    if (analysis.webpackAnalysis) {
      const webpack = analysis.webpackAnalysis;
      
      // Large modules recommendation
      if (webpack.largeModules.length > 0) {
        const totalLargeSize = webpack.largeModules.reduce((sum, m) => sum + m.size, 0);
        
        recommendations.push({
          priority: 'medium',
          category: 'large_modules',
          title: 'Optimize Large Modules',
          description: `${webpack.largeModules.length} modules are larger than 10KB`,
          impact: 'Reduces bundle size and parsing time',
          modules: webpack.largeModules.slice(0, 5).map(m => `${m.name} (${(m.size / 1024).toFixed(1)}KB)`),
          actions: [
            'Review large dependencies for alternatives',
            'Implement tree shaking for unused exports',
            'Split large modules into smaller parts',
            'Use dynamic imports for large features',
          ],
          estimatedSavings: `${(totalLargeSize / 1024).toFixed(1)}KB potential`,
        });
      }
      
      // Duplicate modules recommendation
      if (webpack.duplicateModules.length > 0) {
        const totalDuplicateSize = webpack.duplicateModules.reduce((sum, d) => sum + d.totalSize, 0);
        
        recommendations.push({
          priority: 'high',
          category: 'duplicate_modules',
          title: 'Eliminate Duplicate Modules',
          description: `${webpack.duplicateModules.length} modules are duplicated across bundles`,
          impact: 'Reduces bundle size and memory usage',
          duplicates: webpack.duplicateModules.slice(0, 3).map(d => `${d.name} (${d.instances} instances)`),
          actions: [
            'Configure webpack optimization.splitChunks',
            'Review import patterns to avoid duplication',
            'Use shared chunks for common dependencies',
            'Implement proper dependency management',
          ],
          estimatedSavings: `${(totalDuplicateSize / 1024).toFixed(1)}KB`,
        });
      }
    }
    
    // Framework optimization
    const frameworkBundle = this.results.bundles.find(b => b.route.includes('framework'));
    if (frameworkBundle && frameworkBundle.sizeKB > 80) {
      recommendations.push({
        priority: 'medium',
        category: 'framework',
        title: 'Optimize Framework Bundle',
        description: `Framework bundle (${frameworkBundle.sizeKB.toFixed(1)}KB) is larger than expected`,
        impact: 'Improves initial load performance',
        actions: [
          'Review React/Next.js bundle composition',
          'Consider framework alternatives if appropriate',
          'Optimize polyfills and runtime code',
          'Check for unnecessary framework features',
        ],
        estimatedSavings: `${(frameworkBundle.sizeKB - 80).toFixed(1)}KB potential`,
      });
    }
    
    // Add specific optimization for WhatsApp Simulator if present
    const simulatorBundle = this.results.bundles.find(b => b.route.includes('simulator'));
    if (simulatorBundle && simulatorBundle.sizeKB > 50) {
      recommendations.push({
        priority: 'medium',
        category: 'whatsapp_simulator',
        title: 'Optimize WhatsApp Simulator Bundle',
        description: 'WhatsApp Simulator bundle contains heavy dependencies (GIF.js, html2canvas)',
        impact: 'Improves page load for simulator features',
        actions: [
          'Lazy load GIF export functionality',
          'Split simulator into base and export features',
          'Optimize canvas operations',
          'Consider WebWorker for GIF processing',
        ],
        estimatedSavings: '20-30KB potential',
      });
    }
    
    this.results.recommendations = recommendations.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }

  evaluateThresholds() {
    console.log('🎯 Evaluating bundle size thresholds...');
    
    const analysis = this.results.analysis;
    const issues = [];
    let passed = true;
    
    // Check first load JS threshold
    if (analysis.totalFirstLoadJS > BUNDLE_CONFIG.thresholds.firstLoadJS) {
      passed = false;
      issues.push({
        type: 'first_load_js',
        severity: 'critical',
        message: `First Load JS (${analysis.totalFirstLoadJS.toFixed(1)}KB) exceeds threshold (${BUNDLE_CONFIG.thresholds.firstLoadJS}KB)`,
        current: analysis.totalFirstLoadJS,
        threshold: BUNDLE_CONFIG.thresholds.firstLoadJS,
      });
    }
    
    // Check total JS threshold
    if (analysis.totalJS > BUNDLE_CONFIG.thresholds.totalJS) {
      passed = false;
      issues.push({
        type: 'total_js',
        severity: 'high',
        message: `Total JS (${analysis.totalJS.toFixed(1)}KB) exceeds threshold (${BUNDLE_CONFIG.thresholds.totalJS}KB)`,
        current: analysis.totalJS,
        threshold: BUNDLE_CONFIG.thresholds.totalJS,
      });
    }
    
    // Check individual bundles
    for (const bundle of analysis.oversizedBundles) {
      issues.push({
        type: 'individual_bundle',
        severity: 'medium',
        message: `Bundle ${bundle.route} (${bundle.sizeKB.toFixed(1)}KB) exceeds threshold (${bundle.threshold}KB)`,
        bundle: bundle.route,
        current: bundle.sizeKB,
        threshold: bundle.threshold,
      });
    }
    
    // Check critical bundles
    for (const bundle of analysis.criticalBundles) {
      const expectedSize = BUNDLE_CONFIG.expectedBundles[bundle.route]?.maxSize;
      if (expectedSize && bundle.sizeKB > expectedSize) {
        passed = false;
        issues.push({
          type: 'critical_bundle',
          severity: 'critical',
          message: `Critical bundle ${bundle.route} (${bundle.sizeKB.toFixed(1)}KB) exceeds expected size (${expectedSize}KB)`,
          bundle: bundle.route,
          current: bundle.sizeKB,
          threshold: expectedSize,
        });
      }
    }
    
    this.results.passed = passed;
    this.results.issues = issues;
    this.results.analysis.evaluation = {
      passed,
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
    };
  }

  async generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(this.reportDir, `bundle-analysis-${timestamp}.json`);
    const htmlPath = path.join(this.reportDir, `bundle-analysis-${timestamp}.html`);

    // Save JSON report
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));

    // Generate HTML report
    const html = this.generateHTMLReport();
    await fs.writeFile(htmlPath, html);

    console.log(`📊 Bundle analysis report saved: ${jsonPath}`);
    console.log(`🌐 HTML report saved: ${htmlPath}`);

    return { jsonPath, htmlPath };
  }

  generateHTMLReport() {
    const { bundles, analysis, recommendations, issues, passed } = this.results;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bundle Analysis Report - ${this.results.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .status { padding: 10px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .passed { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .failed { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .card { background: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #007acc; }
        .metric { margin: 5px 0; }
        .bundles-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .bundles-table th, .bundles-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .bundles-table th { background: #f8f9fa; }
        .oversized { background: #fff3cd; }
        .critical { background: #f8d7da; }
        .recommendations { margin: 30px 0; }
        .recommendation { margin: 15px 0; padding: 15px; border-radius: 6px; }
        .high { background: #f8d7da; border-left: 4px solid #dc3545; }
        .medium { background: #fff3cd; border-left: 4px solid #ffc107; }
        .low { background: #d1ecf1; border-left: 4px solid #17a2b8; }
        .issues { margin: 20px 0; }
        .issue { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .issue.critical { background: #f8d7da; }
        .issue.high { background: #fff3cd; }
        .issue.medium { background: #e2e3e5; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Bundle Analysis Report</h1>
            <p>Generated: ${this.results.timestamp}</p>
        </div>

        <div class="status ${passed ? 'passed' : 'failed'}">
            <h2>${passed ? '✅ All Bundle Size Checks Passed' : '❌ Bundle Size Issues Detected'}</h2>
            ${analysis.evaluation ? `
                <p>${analysis.evaluation.criticalIssues} critical, ${analysis.evaluation.highIssues} high, ${analysis.evaluation.mediumIssues} medium priority issues</p>
            ` : ''}
        </div>

        <div class="summary">
            <div class="card">
                <h3>📊 Bundle Summary</h3>
                <div class="metric">Total Bundles: ${analysis.totalBundles}</div>
                <div class="metric">Static Pages: ${analysis.staticPages}</div>
                <div class="metric">Server Pages: ${analysis.serverPages}</div>
                <div class="metric">SSR Pages: ${analysis.ssrPages}</div>
            </div>

            <div class="card">
                <h3>📈 Size Metrics</h3>
                <div class="metric">First Load JS: ${analysis.totalFirstLoadJS?.toFixed(1)}KB</div>
                <div class="metric">Total JS: ${analysis.totalJS?.toFixed(1)}KB</div>
                <div class="metric">Largest Bundle: ${analysis.largestBundle?.sizeKB.toFixed(1)}KB</div>
                <div class="metric">Oversized Bundles: ${analysis.oversizedBundles?.length || 0}</div>
            </div>

            <div class="card">
                <h3>🎯 Thresholds</h3>
                <div class="metric">First Load JS: ${BUNDLE_CONFIG.thresholds.firstLoadJS}KB</div>
                <div class="metric">Total JS: ${BUNDLE_CONFIG.thresholds.totalJS}KB</div>
                <div class="metric">Individual: ${BUNDLE_CONFIG.thresholds.individual}KB</div>
                <div class="metric">Total CSS: ${BUNDLE_CONFIG.thresholds.totalCSS}KB</div>
            </div>
        </div>

        ${issues && issues.length > 0 ? `
        <div class="issues">
            <h2>🚨 Issues Found</h2>
            ${issues.map(issue => `
                <div class="issue ${issue.severity}">
                    <strong>${issue.type.replace(/_/g, ' ').toUpperCase()}:</strong> ${issue.message}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="bundles">
            <h2>📦 Bundle Details</h2>
            <table class="bundles-table">
                <thead>
                    <tr>
                        <th>Route</th>
                        <th>Type</th>
                        <th>Size (KB)</th>
                        <th>First Load JS (KB)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${bundles.map(bundle => `
                        <tr class="${analysis.oversizedBundles?.find(o => o.route === bundle.route) ? 'oversized' : ''} ${this.isCriticalBundle(bundle.route) ? 'critical' : ''}">
                            <td><code>${bundle.route}</code></td>
                            <td>${bundle.type}</td>
                            <td>${bundle.sizeKB.toFixed(1)}</td>
                            <td>${bundle.firstLoadKB.toFixed(1)}</td>
                            <td>
                                ${analysis.oversizedBundles?.find(o => o.route === bundle.route) ? '⚠️ Oversized' : '✅ OK'}
                                ${this.isCriticalBundle(bundle.route) ? ' 🔥 Critical' : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>💡 Optimization Recommendations</h2>
            ${recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <h3>${rec.title} (${rec.priority.toUpperCase()} Priority)</h3>
                    <p><strong>Issue:</strong> ${rec.description}</p>
                    <p><strong>Impact:</strong> ${rec.impact}</p>
                    ${rec.estimatedSavings ? `<p><strong>Potential Savings:</strong> ${rec.estimatedSavings}</p>` : ''}
                    <p><strong>Actions:</strong></p>
                    <ul>
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                    ${rec.bundles ? `
                        <p><strong>Affected Bundles:</strong></p>
                        <ul>
                            ${rec.bundles.map(bundle => `<li><code>${bundle}</code></li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }

  printSummary() {
    const { analysis, recommendations, issues, passed } = this.results;
    
    console.log('\n📦 BUNDLE ANALYSIS SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`\n📊 Bundle Overview:`);
    console.log(`  Total Bundles: ${analysis.totalBundles}`);
    console.log(`  First Load JS: ${analysis.totalFirstLoadJS?.toFixed(1)}KB (threshold: ${BUNDLE_CONFIG.thresholds.firstLoadJS}KB)`);
    console.log(`  Total JS: ${analysis.totalJS?.toFixed(1)}KB (threshold: ${BUNDLE_CONFIG.thresholds.totalJS}KB)`);
    
    if (analysis.largestBundle) {
      console.log(`  Largest Bundle: ${analysis.largestBundle.route} (${analysis.largestBundle.sizeKB.toFixed(1)}KB)`);
    }
    
    console.log(`\n🎯 Threshold Evaluation: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (issues && issues.length > 0) {
      const critical = issues.filter(i => i.severity === 'critical').length;
      const high = issues.filter(i => i.severity === 'high').length;
      const medium = issues.filter(i => i.severity === 'medium').length;
      
      console.log(`  Issues: ${critical} critical, ${high} high, ${medium} medium`);
      
      // Show critical issues
      const criticalIssues = issues.filter(i => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        console.log(`\n🚨 Critical Issues:`);
        criticalIssues.forEach(issue => {
          console.log(`  • ${issue.message}`);
        });
      }
    }
    
    // Show top recommendations
    const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecs.length > 0) {
      console.log(`\n💡 Top Recommendations:`);
      highPriorityRecs.forEach(rec => {
        console.log(`  • ${rec.title}`);
        console.log(`    ${rec.description}`);
      });
    }
    
    console.log('\n='.repeat(50));
  }
}

// Main execution
async function runBundleAnalysis() {
  const analyzer = new BundleAnalyzer();
  
  try {
    await analyzer.initialize();
    await analyzer.analyzeBundles();
    
    const { jsonPath, htmlPath } = await analyzer.generateReport();
    
    analyzer.printSummary();
    
    // Exit with appropriate code
    if (!analyzer.results.passed) {
      const criticalIssues = analyzer.results.issues.filter(i => i.severity === 'critical').length;
      console.log(`\n🚨 Bundle analysis failed with ${criticalIssues} critical issues`);
      process.exit(1);
    } else {
      console.log(`\n✅ Bundle analysis passed all requirements`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { BundleAnalyzer, runBundleAnalysis, BUNDLE_CONFIG };

// Run if called directly
if (require.main === module) {
  runBundleAnalysis();
}