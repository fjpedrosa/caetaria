/**
 * Enhanced Coverage Reporting for Supabase Integration
 *
 * Provides detailed coverage analysis and reporting specifically for
 * database operations, repository patterns, and integration tests.
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// COVERAGE CONFIGURATION
// =============================================================================

export interface CoverageConfig {
  outputDir: string;
  thresholds: {
    domain: { branches: number; functions: number; lines: number; statements: number };
    application: { branches: number; functions: number; lines: number; statements: number };
    infrastructure: { branches: number; functions: number; lines: number; statements: number };
    ui: { branches: number; functions: number; lines: number; statements: number };
  };
  modules: string[];
  generateDetailedReport: boolean;
}

export const DEFAULT_COVERAGE_CONFIG: CoverageConfig = {
  outputDir: 'coverage',
  thresholds: {
    domain: { branches: 95, functions: 95, lines: 95, statements: 95 },
    application: { branches: 90, functions: 90, lines: 90, statements: 90 },
    infrastructure: { branches: 85, functions: 85, lines: 90, statements: 90 },
    ui: { branches: 80, functions: 80, lines: 85, statements: 85 },
  },
  modules: ['marketing', 'onboarding', 'analytics', 'pricing'],
  generateDetailedReport: true,
};

// =============================================================================
// COVERAGE ANALYSIS TYPES
// =============================================================================

export interface FileCoverage {
  path: string;
  statements: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  lines: { total: number; covered: number; pct: number };
}

export interface ModuleCoverage {
  name: string;
  layer: 'domain' | 'application' | 'infrastructure' | 'ui';
  files: FileCoverage[];
  summary: {
    statements: { total: number; covered: number; pct: number };
    branches: { total: number; covered: number; pct: number };
    functions: { total: number; covered: number; pct: number };
    lines: { total: number; covered: number; pct: number };
  };
  thresholdsMet: {
    statements: boolean;
    branches: boolean;
    functions: boolean;
    lines: boolean;
  };
}

export interface CoverageReport {
  timestamp: string;
  testType: 'unit' | 'integration' | 'e2e';
  modules: ModuleCoverage[];
  globalSummary: {
    statements: { total: number; covered: number; pct: number };
    branches: { total: number; covered: number; pct: number };
    functions: { total: number; covered: number; pct: number };
    lines: { total: number; covered: number; pct: number };
  };
  thresholdsStatus: {
    passed: number;
    failed: number;
    details: Array<{
      module: string;
      layer: string;
      metric: string;
      actual: number;
      expected: number;
    }>;
  };
}

// =============================================================================
// COVERAGE ANALYZER
// =============================================================================

export class CoverageAnalyzer {
  private config: CoverageConfig;

  constructor(config: Partial<CoverageConfig> = {}) {
    this.config = { ...DEFAULT_COVERAGE_CONFIG, ...config };
  }

  /**
   * Analyze coverage from Jest coverage report
   */
  async analyzeCoverage(testType: 'unit' | 'integration' | 'e2e' = 'unit'): Promise<CoverageReport> {
    const coverageSummaryPath = path.join(this.config.outputDir, 'coverage-summary.json');

    if (!fs.existsSync(coverageSummaryPath)) {
      throw new Error(`Coverage summary not found at ${coverageSummaryPath}. Run tests with --coverage first.`);
    }

    const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf-8'));

    const modules = await this.analyzeModules(coverageData);
    const globalSummary = this.calculateGlobalSummary(modules);
    const thresholdsStatus = this.checkThresholds(modules);

    return {
      timestamp: new Date().toISOString(),
      testType,
      modules,
      globalSummary,
      thresholdsStatus,
    };
  }

  /**
   * Analyze coverage by module and layer
   */
  private async analyzeModules(coverageData: any): Promise<ModuleCoverage[]> {
    const modules: ModuleCoverage[] = [];

    for (const moduleName of this.config.modules) {
      const layers = ['domain', 'application', 'infrastructure', 'ui'] as const;

      for (const layer of layers) {
        const moduleFiles = this.getModuleFiles(coverageData, moduleName, layer);

        if (moduleFiles.length === 0) continue;

        const moduleCoverage: ModuleCoverage = {
          name: moduleName,
          layer,
          files: moduleFiles,
          summary: this.calculateModuleSummary(moduleFiles),
          thresholdsMet: this.checkModuleThresholds(moduleFiles, layer),
        };

        modules.push(moduleCoverage);
      }
    }

    return modules;
  }

  /**
   * Get files for a specific module and layer
   */
  private getModuleFiles(coverageData: any, moduleName: string, layer: string): FileCoverage[] {
    const files: FileCoverage[] = [];
    const pathPattern = `src/modules/${moduleName}/${layer}/`;

    for (const [filePath, fileData] of Object.entries(coverageData)) {
      if (filePath.includes(pathPattern) && !filePath.includes('__tests__')) {
        files.push({
          path: filePath,
          statements: (fileData as any).statements,
          branches: (fileData as any).branches,
          functions: (fileData as any).functions,
          lines: (fileData as any).lines,
        });
      }
    }

    return files;
  }

  /**
   * Calculate summary for a module
   */
  private calculateModuleSummary(files: FileCoverage[]) {
    const summary = {
      statements: { total: 0, covered: 0, pct: 0 },
      branches: { total: 0, covered: 0, pct: 0 },
      functions: { total: 0, covered: 0, pct: 0 },
      lines: { total: 0, covered: 0, pct: 0 },
    };

    for (const file of files) {
      summary.statements.total += file.statements.total;
      summary.statements.covered += file.statements.covered;
      summary.branches.total += file.branches.total;
      summary.branches.covered += file.branches.covered;
      summary.functions.total += file.functions.total;
      summary.functions.covered += file.functions.covered;
      summary.lines.total += file.lines.total;
      summary.lines.covered += file.lines.covered;
    }

    // Calculate percentages
    summary.statements.pct = this.calculatePercentage(summary.statements.covered, summary.statements.total);
    summary.branches.pct = this.calculatePercentage(summary.branches.covered, summary.branches.total);
    summary.functions.pct = this.calculatePercentage(summary.functions.covered, summary.functions.total);
    summary.lines.pct = this.calculatePercentage(summary.lines.covered, summary.lines.total);

    return summary;
  }

  /**
   * Calculate global summary
   */
  private calculateGlobalSummary(modules: ModuleCoverage[]) {
    const globalSummary = {
      statements: { total: 0, covered: 0, pct: 0 },
      branches: { total: 0, covered: 0, pct: 0 },
      functions: { total: 0, covered: 0, pct: 0 },
      lines: { total: 0, covered: 0, pct: 0 },
    };

    for (const module of modules) {
      globalSummary.statements.total += module.summary.statements.total;
      globalSummary.statements.covered += module.summary.statements.covered;
      globalSummary.branches.total += module.summary.branches.total;
      globalSummary.branches.covered += module.summary.branches.covered;
      globalSummary.functions.total += module.summary.functions.total;
      globalSummary.functions.covered += module.summary.functions.covered;
      globalSummary.lines.total += module.summary.lines.total;
      globalSummary.lines.covered += module.summary.lines.covered;
    }

    globalSummary.statements.pct = this.calculatePercentage(globalSummary.statements.covered, globalSummary.statements.total);
    globalSummary.branches.pct = this.calculatePercentage(globalSummary.branches.covered, globalSummary.branches.total);
    globalSummary.functions.pct = this.calculatePercentage(globalSummary.functions.covered, globalSummary.functions.total);
    globalSummary.lines.pct = this.calculatePercentage(globalSummary.lines.covered, globalSummary.lines.total);

    return globalSummary;
  }

  /**
   * Check if module meets thresholds
   */
  private checkModuleThresholds(files: FileCoverage[], layer: string) {
    const summary = this.calculateModuleSummary(files);
    const thresholds = this.config.thresholds[layer as keyof typeof this.config.thresholds];

    return {
      statements: summary.statements.pct >= thresholds.statements,
      branches: summary.branches.pct >= thresholds.branches,
      functions: summary.functions.pct >= thresholds.functions,
      lines: summary.lines.pct >= thresholds.lines,
    };
  }

  /**
   * Check thresholds across all modules
   */
  private checkThresholds(modules: ModuleCoverage[]) {
    let passed = 0;
    let failed = 0;
    const details: Array<{
      module: string;
      layer: string;
      metric: string;
      actual: number;
      expected: number;
    }> = [];

    for (const module of modules) {
      const thresholds = this.config.thresholds[module.layer];
      const metrics = ['statements', 'branches', 'functions', 'lines'] as const;

      for (const metric of metrics) {
        const actual = module.summary[metric].pct;
        const expected = thresholds[metric];

        if (actual >= expected) {
          passed++;
        } else {
          failed++;
          details.push({
            module: module.name,
            layer: module.layer,
            metric,
            actual,
            expected,
          });
        }
      }
    }

    return { passed, failed, details };
  }

  /**
   * Calculate percentage safely
   */
  private calculatePercentage(covered: number, total: number): number {
    if (total === 0) return 100;
    return Math.round((covered / total) * 100 * 100) / 100; // Round to 2 decimal places
  }

  // ===========================================================================
  // REPORTING METHODS
  // ===========================================================================

  /**
   * Generate detailed HTML report
   */
  async generateDetailedReport(report: CoverageReport): Promise<string> {
    const reportPath = path.join(this.config.outputDir, `coverage-detailed-${report.testType}.html`);

    const html = this.generateHTMLReport(report);
    fs.writeFileSync(reportPath, html, 'utf-8');

    console.log(`📊 Detailed coverage report generated: ${reportPath}`);
    return reportPath;
  }

  /**
   * Generate JSON report for CI/CD integration
   */
  async generateJSONReport(report: CoverageReport): Promise<string> {
    const reportPath = path.join(this.config.outputDir, `coverage-detailed-${report.testType}.json`);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`📄 JSON coverage report generated: ${reportPath}`);
    return reportPath;
  }

  /**
   * Print console summary
   */
  printConsoleSummary(report: CoverageReport): void {
    console.log('\n' + '='.repeat(80));
    console.log(`📊 COVERAGE REPORT - ${report.testType.toUpperCase()} TESTS`);
    console.log('='.repeat(80));

    console.log('\n🌐 GLOBAL SUMMARY:');
    console.log(`  Statements: ${report.globalSummary.statements.pct}% (${report.globalSummary.statements.covered}/${report.globalSummary.statements.total})`);
    console.log(`  Branches:   ${report.globalSummary.branches.pct}% (${report.globalSummary.branches.covered}/${report.globalSummary.branches.total})`);
    console.log(`  Functions:  ${report.globalSummary.functions.pct}% (${report.globalSummary.functions.covered}/${report.globalSummary.functions.total})`);
    console.log(`  Lines:      ${report.globalSummary.lines.pct}% (${report.globalSummary.lines.covered}/${report.globalSummary.lines.total})`);

    console.log('\n📋 MODULE BREAKDOWN:');
    for (const module of report.modules) {
      const status = Object.values(module.thresholdsMet).every(Boolean) ? '✅' : '❌';
      console.log(`  ${status} ${module.name} (${module.layer}): ${module.summary.lines.pct}% lines`);
    }

    if (report.thresholdsStatus.failed > 0) {
      console.log('\n❌ THRESHOLD FAILURES:');
      for (const failure of report.thresholdsStatus.details) {
        console.log(`  ${failure.module}/${failure.layer} ${failure.metric}: ${failure.actual}% < ${failure.expected}%`);
      }
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Generate HTML report content
   */
  private generateHTMLReport(report: CoverageReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Coverage Report - ${report.testType.toUpperCase()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; color: #2196F3; }
        .metric .details { color: #666; font-size: 0.9em; }
        .modules { margin-top: 30px; }
        .module { background: white; border: 1px solid #ddd; margin-bottom: 20px; border-radius: 8px; }
        .module-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; font-weight: bold; }
        .module-content { padding: 15px; }
        .threshold-pass { color: #4CAF50; }
        .threshold-fail { color: #F44336; }
        .failures { background: #ffebee; border: 1px solid #ffcdd2; padding: 20px; border-radius: 8px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Coverage Report - ${report.testType.toUpperCase()} Tests</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Statements</h3>
            <div class="value">${report.globalSummary.statements.pct}%</div>
            <div class="details">${report.globalSummary.statements.covered}/${report.globalSummary.statements.total}</div>
        </div>
        <div class="metric">
            <h3>Branches</h3>
            <div class="value">${report.globalSummary.branches.pct}%</div>
            <div class="details">${report.globalSummary.branches.covered}/${report.globalSummary.branches.total}</div>
        </div>
        <div class="metric">
            <h3>Functions</h3>
            <div class="value">${report.globalSummary.functions.pct}%</div>
            <div class="details">${report.globalSummary.functions.covered}/${report.globalSummary.functions.total}</div>
        </div>
        <div class="metric">
            <h3>Lines</h3>
            <div class="value">${report.globalSummary.lines.pct}%</div>
            <div class="details">${report.globalSummary.lines.covered}/${report.globalSummary.lines.total}</div>
        </div>
    </div>

    <div class="modules">
        <h2>Module Coverage</h2>
        ${report.modules.map(module => `
            <div class="module">
                <div class="module-header">
                    ${module.name} - ${module.layer} layer
                    <span class="${Object.values(module.thresholdsMet).every(Boolean) ? 'threshold-pass' : 'threshold-fail'}">
                        ${Object.values(module.thresholdsMet).every(Boolean) ? '✅ Thresholds Met' : '❌ Below Threshold'}
                    </span>
                </div>
                <div class="module-content">
                    <table>
                        <tr><th>Metric</th><th>Coverage</th><th>Total</th><th>Covered</th></tr>
                        <tr><td>Statements</td><td>${module.summary.statements.pct}%</td><td>${module.summary.statements.total}</td><td>${module.summary.statements.covered}</td></tr>
                        <tr><td>Branches</td><td>${module.summary.branches.pct}%</td><td>${module.summary.branches.total}</td><td>${module.summary.branches.covered}</td></tr>
                        <tr><td>Functions</td><td>${module.summary.functions.pct}%</td><td>${module.summary.functions.total}</td><td>${module.summary.functions.covered}</td></tr>
                        <tr><td>Lines</td><td>${module.summary.lines.pct}%</td><td>${module.summary.lines.total}</td><td>${module.summary.lines.covered}</td></tr>
                    </table>
                </div>
            </div>
        `).join('')}
    </div>

    ${report.thresholdsStatus.failed > 0 ? `
        <div class="failures">
            <h2>❌ Threshold Failures (${report.thresholdsStatus.failed})</h2>
            <table>
                <tr><th>Module</th><th>Layer</th><th>Metric</th><th>Actual</th><th>Expected</th></tr>
                ${report.thresholdsStatus.details.map(failure => `
                    <tr>
                        <td>${failure.module}</td>
                        <td>${failure.layer}</td>
                        <td>${failure.metric}</td>
                        <td>${failure.actual}%</td>
                        <td>${failure.expected}%</td>
                    </tr>
                `).join('')}
            </table>
        </div>
    ` : '<div class="threshold-pass"><h2>✅ All Thresholds Met!</h2></div>'}
</body>
</html>`;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Quick coverage analysis for CI/CD
 */
export const quickCoverageCheck = async (testType: 'unit' | 'integration' | 'e2e' = 'unit'): Promise<boolean> => {
  const analyzer = new CoverageAnalyzer();
  const report = await analyzer.analyzeCoverage(testType);

  analyzer.printConsoleSummary(report);

  return report.thresholdsStatus.failed === 0;
};

/**
 * Generate all coverage reports
 */
export const generateAllReports = async (testType: 'unit' | 'integration' | 'e2e' = 'unit') => {
  const analyzer = new CoverageAnalyzer();
  const report = await analyzer.analyzeCoverage(testType);

  const htmlPath = await analyzer.generateDetailedReport(report);
  const jsonPath = await analyzer.generateJSONReport(report);

  analyzer.printConsoleSummary(report);

  return { report, htmlPath, jsonPath };
};

// =============================================================================
// EXPORTS
// =============================================================================

export { CoverageAnalyzer };
export type { CoverageConfig, CoverageReport, FileCoverage,ModuleCoverage };