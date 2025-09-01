/**
 * Performance Monitoring Dashboard
 * 
 * Real-time performance monitoring dashboard that aggregates
 * all performance metrics and provides actionable insights.
 */

const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const { performance } = require('perf_hooks');

// Dashboard configuration
const DASHBOARD_CONFIG = {
  // Server settings
  server: {
    port: process.env.PERFORMANCE_DASHBOARD_PORT || 3001,
    host: process.env.PERFORMANCE_DASHBOARD_HOST || 'localhost',
    refreshInterval: 5000, // 5 seconds
  },

  // Metrics collection
  metrics: {
    realTimeWindow: 300000, // 5 minutes of real-time data
    historyRetention: 86400000, // 24 hours of history
    aggregationInterval: 60000, // 1 minute aggregation
  },

  // Alert thresholds
  alerts: {
    responseTime: 200,      // API response time alert threshold (ms)
    memoryUsage: 100,       // Memory usage alert threshold (MB)
    errorRate: 5,           // Error rate alert threshold (%)
    bundleSize: 350,        // Bundle size alert threshold (KB)
    lighthouseScore: 85,    // Lighthouse score alert threshold
  },

  // Dashboard features
  features: {
    realTimeUpdates: true,
    historicalCharts: true,
    alertSystem: true,
    exportReports: true,
    comparisons: true,
  },
};

class PerformanceDashboard {
  constructor() {
    this.server = null;
    this.metrics = {
      realTime: [],
      history: [],
      aggregated: {},
      alerts: [],
    };
    this.reportsDir = path.join(process.cwd(), 'performance/reports');
    this.clients = new Set(); // WebSocket clients for real-time updates
  }

  async initialize() {
    console.log('📊 Initializing Performance Dashboard...');
    
    // Load historical data
    await this.loadHistoricalData();
    
    // Start metrics collection
    this.startMetricsCollection();
    
    // Start alert monitoring
    this.startAlertMonitoring();
    
    console.log('✅ Performance dashboard initialized');
  }

  async start() {
    console.log(`🚀 Starting Performance Dashboard on http://${DASHBOARD_CONFIG.server.host}:${DASHBOARD_CONFIG.server.port}`);
    
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(DASHBOARD_CONFIG.server.port, DASHBOARD_CONFIG.server.host, () => {
      console.log(`✅ Dashboard server running on http://${DASHBOARD_CONFIG.server.host}:${DASHBOARD_CONFIG.server.port}`);
      console.log('📊 Dashboard features available:');
      console.log('  • /dashboard - Main performance dashboard');
      console.log('  • /api/metrics - Current metrics API');
      console.log('  • /api/history - Historical data API');
      console.log('  • /api/alerts - Active alerts API');
      console.log('  • /api/reports - Performance reports API');
    });
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      switch (pathname) {
        case '/dashboard':
          await this.serveDashboard(res);
          break;
        case '/api/metrics':
          await this.serveMetrics(res);
          break;
        case '/api/history':
          await this.serveHistory(res);
          break;
        case '/api/alerts':
          await this.serveAlerts(res);
          break;
        case '/api/reports':
          await this.serveReports(res);
          break;
        case '/api/export':
          await this.exportData(res, url.searchParams);
          break;
        case '/health':
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'healthy', timestamp: Date.now() }));
          break;
        default:
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
      }
    } catch (error) {
      console.error('❌ Dashboard request error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }

  async serveDashboard(res) {
    const html = await this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  async serveMetrics(res) {
    const currentMetrics = await this.getCurrentMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(currentMetrics));
  }

  async serveHistory(res) {
    const history = this.metrics.history.slice(-100); // Last 100 entries
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(history));
  }

  async serveAlerts(res) {
    const activeAlerts = this.metrics.alerts.filter(alert => alert.active);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(activeAlerts));
  }

  async serveReports(res) {
    const reports = await this.getAvailableReports();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(reports));
  }

  async exportData(res, params) {
    const format = params.get('format') || 'json';
    const timeRange = params.get('timeRange') || '24h';
    const metrics = params.get('metrics') || 'all';

    const exportData = await this.generateExportData(timeRange, metrics);

    if (format === 'csv') {
      const csv = this.convertToCSV(exportData);
      res.writeHead(200, { 
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="performance-data-${Date.now()}.csv"`
      });
      res.end(csv);
    } else {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="performance-data-${Date.now()}.json"`
      });
      res.end(JSON.stringify(exportData, null, 2));
    }
  }

  async loadHistoricalData() {
    console.log('📚 Loading historical performance data...');
    
    try {
      // Load recent reports from various sources
      const lighthouseData = await this.loadRecentReports('lighthouse', 'summary');
      const bundleData = await this.loadRecentReports('bundle', 'bundle-analysis');
      const memoryData = await this.loadRecentReports('memory', 'memory-summary');

      // Process and aggregate historical data
      this.metrics.history = this.aggregateHistoricalData({
        lighthouse: lighthouseData,
        bundle: bundleData,
        memory: memoryData,
      });

      console.log(`✅ Loaded ${this.metrics.history.length} historical data points`);
    } catch (error) {
      console.warn('⚠️ Could not load historical data:', error.message);
    }
  }

  async loadRecentReports(type, prefix) {
    try {
      const typeDir = path.join(this.reportsDir, type);
      const files = await fs.readdir(typeDir);
      
      const recentFiles = files
        .filter(f => f.includes(prefix) && f.endsWith('.json'))
        .sort()
        .slice(-10); // Last 10 files

      const reports = [];
      for (const file of recentFiles) {
        const filePath = path.join(typeDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        reports.push({ file, data, timestamp: data.timestamp || Date.now() });
      }

      return reports;
    } catch (error) {
      console.warn(`⚠️ Could not load ${type} reports:`, error.message);
      return [];
    }
  }

  aggregateHistoricalData(sources) {
    const aggregated = [];
    const timeMap = new Map();

    // Group data by approximate time windows (1 hour windows)
    for (const [type, reports] of Object.entries(sources)) {
      for (const report of reports) {
        const timestamp = report.timestamp;
        const hourWindow = Math.floor(timestamp / 3600000) * 3600000;
        
        if (!timeMap.has(hourWindow)) {
          timeMap.set(hourWindow, { timestamp: hourWindow });
        }
        
        const entry = timeMap.get(hourWindow);
        entry[type] = this.extractMetrics(type, report.data);
      }
    }

    return Array.from(timeMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  extractMetrics(type, data) {
    switch (type) {
      case 'lighthouse':
        return {
          performance: data.overall?.desktop?.scores?.performance || 0,
          accessibility: data.overall?.desktop?.scores?.accessibility || 0,
          bestPractices: data.overall?.desktop?.scores?.bestPractices || 0,
          seo: data.overall?.desktop?.scores?.seo || 0,
        };
      
      case 'bundle':
        return {
          firstLoadJS: data.analysis?.totalFirstLoadJS || 0,
          totalJS: data.analysis?.totalJS || 0,
          passed: data.passed || false,
        };
      
      case 'memory':
        return {
          averageGrowthRate: data.overall?.averageGrowthRate || 0,
          peakMemoryUsage: data.overall?.peakMemoryUsage || 0,
          passed: data.overall?.passed || 0,
        };
      
      default:
        return {};
    }
  }

  startMetricsCollection() {
    console.log('📊 Starting real-time metrics collection...');
    
    setInterval(async () => {
      const metrics = await this.collectCurrentMetrics();
      
      // Add to real-time buffer
      this.metrics.realTime.push({
        ...metrics,
        timestamp: Date.now(),
      });
      
      // Maintain real-time window size
      const cutoff = Date.now() - DASHBOARD_CONFIG.metrics.realTimeWindow;
      this.metrics.realTime = this.metrics.realTime.filter(m => m.timestamp > cutoff);
      
      // Notify connected clients (if using WebSockets)
      this.notifyClients('metrics', metrics);
      
    }, DASHBOARD_CONFIG.metrics.aggregationInterval);
  }

  async collectCurrentMetrics() {
    const metrics = {
      system: await this.getSystemMetrics(),
      performance: await this.getPerformanceMetrics(),
      alerts: this.getActiveAlerts(),
    };

    return metrics;
  }

  async getSystemMetrics() {
    return {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      timestamp: Date.now(),
    };
  }

  async getPerformanceMetrics() {
    // This would integrate with actual performance monitoring
    // For now, return simulated metrics
    return {
      responseTime: Math.random() * 100 + 50, // 50-150ms
      throughput: Math.random() * 1000 + 500, // 500-1500 req/min
      errorRate: Math.random() * 2, // 0-2%
      activeConnections: Math.floor(Math.random() * 100) + 10,
    };
  }

  getActiveAlerts() {
    return this.metrics.alerts.filter(alert => alert.active).length;
  }

  startAlertMonitoring() {
    console.log('🚨 Starting alert monitoring...');
    
    setInterval(() => {
      this.checkAlerts();
    }, 30000); // Check every 30 seconds
  }

  checkAlerts() {
    const currentTime = Date.now();
    const recentMetrics = this.metrics.realTime.slice(-5); // Last 5 data points
    
    if (recentMetrics.length === 0) return;

    // Check response time alerts
    const avgResponseTime = recentMetrics.reduce((sum, m) => 
      sum + (m.performance?.responseTime || 0), 0) / recentMetrics.length;
      
    if (avgResponseTime > DASHBOARD_CONFIG.alerts.responseTime) {
      this.createAlert('high_response_time', 'warning', 
        `Average response time (${avgResponseTime.toFixed(1)}ms) exceeds threshold (${DASHBOARD_CONFIG.alerts.responseTime}ms)`);
    }

    // Check error rate alerts
    const avgErrorRate = recentMetrics.reduce((sum, m) => 
      sum + (m.performance?.errorRate || 0), 0) / recentMetrics.length;
      
    if (avgErrorRate > DASHBOARD_CONFIG.alerts.errorRate) {
      this.createAlert('high_error_rate', 'critical',
        `Error rate (${avgErrorRate.toFixed(1)}%) exceeds threshold (${DASHBOARD_CONFIG.alerts.errorRate}%)`);
    }

    // Auto-resolve old alerts
    this.resolveOldAlerts(currentTime);
  }

  createAlert(type, severity, message) {
    const existingAlert = this.metrics.alerts.find(a => a.type === type && a.active);
    
    if (!existingAlert) {
      const alert = {
        id: `${type}-${Date.now()}`,
        type,
        severity,
        message,
        active: true,
        createdAt: Date.now(),
        count: 1,
      };
      
      this.metrics.alerts.push(alert);
      console.log(`🚨 Alert created: ${severity.toUpperCase()} - ${message}`);
      
      // Notify clients
      this.notifyClients('alert', alert);
    } else {
      existingAlert.count++;
      existingAlert.updatedAt = Date.now();
    }
  }

  resolveOldAlerts(currentTime) {
    const alertAge = 300000; // 5 minutes
    
    for (const alert of this.metrics.alerts) {
      if (alert.active && (currentTime - alert.createdAt) > alertAge) {
        alert.active = false;
        alert.resolvedAt = currentTime;
        console.log(`✅ Alert resolved: ${alert.type}`);
      }
    }
  }

  notifyClients(type, data) {
    // WebSocket notification would go here
    // For now, just log for debugging
    if (this.clients.size > 0) {
      console.log(`📡 Notifying ${this.clients.size} clients: ${type}`);
    }
  }

  async getCurrentMetrics() {
    const latest = this.metrics.realTime.slice(-1)[0] || {};
    const history = this.metrics.history.slice(-24) || []; // Last 24 hours
    const alerts = this.getActiveAlerts();

    return {
      current: latest,
      history,
      alerts,
      summary: {
        totalMetrics: this.metrics.realTime.length,
        historicalPoints: history.length,
        activeAlerts: alerts,
        uptime: process.uptime(),
      },
      timestamp: Date.now(),
    };
  }

  async getAvailableReports() {
    const reports = {};

    try {
      // List all report types
      const reportTypes = ['lighthouse', 'bundle', 'memory', 'regressions'];
      
      for (const type of reportTypes) {
        const typeDir = path.join(this.reportsDir, type);
        try {
          const files = await fs.readdir(typeDir);
          reports[type] = files
            .filter(f => f.endsWith('.json'))
            .sort()
            .slice(-10) // Last 10 files
            .map(file => ({
              name: file,
              path: `/reports/${type}/${file}`,
              size: 0, // Would get actual file size
              modified: Date.now(), // Would get actual modification time
            }));
        } catch (error) {
          reports[type] = [];
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not list reports:', error.message);
    }

    return reports;
  }

  async generateExportData(timeRange, metrics) {
    const hours = this.parseTimeRange(timeRange);
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const filteredHistory = this.metrics.history.filter(h => h.timestamp > cutoff);
    const filteredRealTime = this.metrics.realTime.filter(r => r.timestamp > cutoff);

    return {
      timeRange,
      metrics,
      exportedAt: Date.now(),
      historical: filteredHistory,
      realTime: filteredRealTime,
      alerts: this.metrics.alerts.filter(a => a.createdAt > cutoff),
    };
  }

  parseTimeRange(timeRange) {
    const match = timeRange.match(/^(\d+)([hd])$/);
    if (!match) return 24; // Default to 24 hours
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    return unit === 'h' ? value : value * 24;
  }

  convertToCSV(data) {
    if (!data.historical || data.historical.length === 0) {
      return 'timestamp\n';
    }

    const headers = Object.keys(data.historical[0]).filter(k => k !== 'timestamp');
    const csvHeaders = ['timestamp', ...headers.flatMap(category => 
      Object.keys(data.historical[0][category] || {}).map(metric => `${category}.${metric}`)
    )];

    const csvRows = [csvHeaders.join(',')];

    for (const row of data.historical) {
      const values = [row.timestamp];
      
      for (const category of headers) {
        const categoryData = row[category] || {};
        for (const metric of Object.keys(data.historical[0][category] || {})) {
          values.push(categoryData[metric] || '');
        }
      }
      
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  async generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .metric-label { color: #666; font-size: 0.9em; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .alerts { background: white; padding: 20px; border-radius: 8px; }
        .alert { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .alert.critical { background: #ffebee; border-left: 4px solid #f44336; }
        .alert.warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .alert.info { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .refresh { position: fixed; top: 20px; right: 20px; background: #007acc; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .status-indicator { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; }
        .status-healthy { background: #4caf50; }
        .status-warning { background: #ff9800; }
        .status-critical { background: #f44336; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Dashboard</h1>
            <p>Real-time performance monitoring and analytics</p>
            <span class="status-indicator status-healthy"></span>
            <span id="status">System Healthy</span>
            <span style="margin-left: 20px;">Last updated: <span id="lastUpdate">-</span></span>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Average Response Time</div>
                <div class="metric-value" id="responseTime">-</div>
                <div class="metric-label">ms</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Error Rate</div>
                <div class="metric-value" id="errorRate">-</div>
                <div class="metric-label">%</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Throughput</div>
                <div class="metric-value" id="throughput">-</div>
                <div class="metric-label">req/min</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Active Alerts</div>
                <div class="metric-value" id="activeAlerts">-</div>
                <div class="metric-label">alerts</div>
            </div>
        </div>

        <div class="chart-container">
            <h3>Performance Trends</h3>
            <canvas id="performanceChart" width="400" height="200"></canvas>
        </div>

        <div class="alerts">
            <h3>🚨 Active Alerts</h3>
            <div id="alertsList">
                <p>No active alerts</p>
            </div>
        </div>

        <button class="refresh" onclick="refreshData()">🔄 Refresh</button>
    </div>

    <script>
        let performanceChart;
        
        function initChart() {
            const ctx = document.getElementById('performanceChart').getContext('2d');
            performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Response Time',
                        data: [],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }, {
                        label: 'Error Rate',
                        data: [],
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        async function fetchMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
                return null;
            }
        }

        async function fetchAlerts() {
            try {
                const response = await fetch('/api/alerts');
                const alerts = await response.json();
                return alerts;
            } catch (error) {
                console.error('Failed to fetch alerts:', error);
                return [];
            }
        }

        function updateMetrics(data) {
            if (!data || !data.current) return;

            const current = data.current;
            
            document.getElementById('responseTime').textContent = 
                (current.performance?.responseTime || 0).toFixed(1);
            document.getElementById('errorRate').textContent = 
                (current.performance?.errorRate || 0).toFixed(2);
            document.getElementById('throughput').textContent = 
                Math.round(current.performance?.throughput || 0);
            document.getElementById('activeAlerts').textContent = 
                current.alerts || 0;
                
            document.getElementById('lastUpdate').textContent = 
                new Date().toLocaleTimeString();

            // Update chart
            if (data.history && data.history.length > 0) {
                updateChart(data.history);
            }
        }

        function updateChart(history) {
            const labels = history.map(h => new Date(h.timestamp).toLocaleTimeString()).slice(-20);
            const responseData = history.map(h => h.performance?.responseTime || 0).slice(-20);
            const errorData = history.map(h => h.performance?.errorRate || 0).slice(-20);

            performanceChart.data.labels = labels;
            performanceChart.data.datasets[0].data = responseData;
            performanceChart.data.datasets[1].data = errorData;
            performanceChart.update();
        }

        function updateAlerts(alerts) {
            const alertsList = document.getElementById('alertsList');
            
            if (alerts.length === 0) {
                alertsList.innerHTML = '<p>✅ No active alerts</p>';
                return;
            }

            const alertsHtml = alerts.map(alert => 
                \`<div class="alert \${alert.severity}">
                    <strong>\${alert.severity.toUpperCase()}</strong>: \${alert.message}
                    <small style="float: right;">Count: \${alert.count || 1}</small>
                </div>\`
            ).join('');

            alertsList.innerHTML = alertsHtml;

            // Update status indicator
            const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
            const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
            
            const statusElement = document.querySelector('.status-indicator');
            const statusText = document.getElementById('status');
            
            if (criticalAlerts > 0) {
                statusElement.className = 'status-indicator status-critical';
                statusText.textContent = \`\${criticalAlerts} Critical Alerts\`;
            } else if (warningAlerts > 0) {
                statusElement.className = 'status-indicator status-warning';
                statusText.textContent = \`\${warningAlerts} Warning Alerts\`;
            } else {
                statusElement.className = 'status-indicator status-healthy';
                statusText.textContent = 'System Healthy';
            }
        }

        async function refreshData() {
            const metrics = await fetchMetrics();
            const alerts = await fetchAlerts();
            
            if (metrics) {
                updateMetrics(metrics);
            }
            
            if (alerts) {
                updateAlerts(alerts);
            }
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initChart();
            refreshData();
            
            // Auto-refresh every 5 seconds
            setInterval(refreshData, ${DASHBOARD_CONFIG.server.refreshInterval});
        });
    </script>
</body>
</html>`;
  }

  async stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Performance dashboard stopped');
    }
  }
}

// Main execution
async function startPerformanceDashboard() {
  const dashboard = new PerformanceDashboard();
  
  try {
    await dashboard.initialize();
    await dashboard.start();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down performance dashboard...');
      await dashboard.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start performance dashboard:', error);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { 
  PerformanceDashboard, 
  startPerformanceDashboard, 
  DASHBOARD_CONFIG 
};

// Run if called directly
if (require.main === module) {
  startPerformanceDashboard();
}