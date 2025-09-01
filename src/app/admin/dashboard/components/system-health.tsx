/**
 * System Health Component
 *
 * Comprehensive system health monitoring with real-time metrics,
 * performance tracking, and alert management.
 */

'use client';

import React, { useEffect,useMemo, useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Download,
  Eye,
  Globe,
  HardDrive,
  MemoryStick,
  MessageSquare,
  Minus,
  Network,
  RefreshCw,
  Server,
  Settings,
  TrendingDown,
  TrendingUp,
  Wifi,
  XCircle,
  Zap} from 'lucide-react';

import { Badge } from '@/modules/shared/ui/components/ui/badge';
import { Button } from '@/modules/shared/ui/components/ui/button';
import { Card } from '@/modules/shared/ui/components/ui/card';
import { LoadingSkeleton } from '@/modules/shared/ui/components/ui/loading-skeleton';
import { Select } from '@/modules/shared/ui/components/ui/select';
import { Tabs } from '@/modules/shared/ui/components/ui/tabs';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  history: number[];
  lastUpdated: Date;
}

interface SystemService {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  version?: string;
  dependencies?: string[];
}

interface Props {
  connection: {
    isConnected: boolean;
    isConnecting: boolean;
    state: string;
    subscriptionsCount: number;
    lastHeartbeat?: string;
  };
  leads: {
    isSubscribed: boolean;
    latestEvent?: any;
    eventCount: number;
  };
  analytics: {
    isSubscribed: boolean;
    latestEvent?: any;
    eventCount: number;
  };
}

export const SystemHealth: React.FC<Props> = ({
  connection,
  leads,
  analytics,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Mock health metrics
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 35.2,
      unit: '%',
      status: 'healthy',
      threshold: { warning: 70, critical: 85 },
      trend: 'stable',
      history: [32, 34, 36, 35, 33, 35, 35],
      lastUpdated: new Date(),
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 68.5,
      unit: '%',
      status: 'warning',
      threshold: { warning: 75, critical: 90 },
      trend: 'up',
      history: [65, 66, 67, 68, 69, 68, 69],
      lastUpdated: new Date(),
    },
    {
      id: 'disk',
      name: 'Disk Usage',
      value: 42.1,
      unit: '%',
      status: 'healthy',
      threshold: { warning: 80, critical: 95 },
      trend: 'stable',
      history: [40, 41, 42, 42, 41, 42, 42],
      lastUpdated: new Date(),
    },
    {
      id: 'api_latency',
      name: 'API Latency',
      value: 156,
      unit: 'ms',
      status: 'healthy',
      threshold: { warning: 300, critical: 500 },
      trend: 'down',
      history: [180, 170, 165, 160, 155, 150, 156],
      lastUpdated: new Date(),
    },
    {
      id: 'db_connections',
      name: 'Database Connections',
      value: 23,
      unit: 'active',
      status: 'healthy',
      threshold: { warning: 80, critical: 95 },
      trend: 'stable',
      history: [20, 22, 24, 23, 21, 23, 23],
      lastUpdated: new Date(),
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      value: 0.12,
      unit: '%',
      status: 'healthy',
      threshold: { warning: 1, critical: 5 },
      trend: 'stable',
      history: [0.1, 0.15, 0.08, 0.12, 0.11, 0.13, 0.12],
      lastUpdated: new Date(),
    },
  ]);

  // Mock system services
  const systemServices: SystemService[] = [
    {
      id: 'api',
      name: 'API Server',
      status: 'online',
      uptime: 99.98,
      responseTime: 145,
      errorRate: 0.02,
      lastCheck: new Date(),
      version: 'v2.1.4',
      dependencies: ['database', 'redis'],
    },
    {
      id: 'database',
      name: 'PostgreSQL',
      status: 'online',
      uptime: 99.99,
      responseTime: 12,
      errorRate: 0.001,
      lastCheck: new Date(),
      version: '14.2',
    },
    {
      id: 'redis',
      name: 'Redis Cache',
      status: 'online',
      uptime: 99.95,
      responseTime: 2,
      errorRate: 0,
      lastCheck: new Date(),
      version: '7.0.5',
    },
    {
      id: 'realtime',
      name: 'Real-time Service',
      status: connection.isConnected ? 'online' : 'offline',
      uptime: connection.isConnected ? 99.8 : 0,
      responseTime: 25,
      errorRate: 0.05,
      lastCheck: new Date(),
      version: 'v1.3.2',
      dependencies: ['websocket'],
    },
    {
      id: 'email',
      name: 'Email Service',
      status: 'degraded',
      uptime: 98.2,
      responseTime: 2500,
      errorRate: 1.2,
      lastCheck: new Date(),
      version: 'v1.8.1',
    },
  ];

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate metric updates
      setHealthMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 2,
        lastUpdated: new Date(),
      })));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Calculate overall health score
  const healthScore = useMemo(() => {
    const healthyCount = healthMetrics.filter(m => m.status === 'healthy').length;
    const totalCount = healthMetrics.length;
    return Math.round((healthyCount / totalCount) * 100);
  }, [healthMetrics]);

  // Get status counts
  const statusCounts = useMemo(() => {
    const services = systemServices;
    return {
      online: services.filter(s => s.status === 'online').length,
      degraded: services.filter(s => s.status === 'degraded').length,
      offline: services.filter(s => s.status === 'offline').length,
      total: services.length,
    };
  }, [systemServices]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'cpu':
        return <Cpu className="w-5 h-5 text-blue-500" />;
      case 'memory':
        return <MemoryStick className="w-5 h-5 text-purple-500" />;
      case 'disk':
        return <HardDrive className="w-5 h-5 text-orange-500" />;
      case 'api_latency':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'db_connections':
        return <Database className="w-5 h-5 text-green-500" />;
      case 'error_rate':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatUptime = (uptime: number) => {
    if (uptime >= 99.9) return '99.9%+';
    return `${uptime.toFixed(2)}%`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="text-gray-600 mt-1">
            Overall Health Score: {healthScore}% • {statusCounts.online}/{statusCounts.total} services online
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange as any}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              healthScore >= 95 ? 'bg-green-100' :
              healthScore >= 80 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-2xl font-bold ${
                healthScore >= 95 ? 'text-green-600' :
                healthScore >= 80 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {healthScore}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Health</h3>
            <p className="text-sm text-gray-500 mt-1">System Performance Score</p>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Connection Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                connection.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <div>
                <div className="text-sm font-medium text-gray-900">WebSocket</div>
                <div className="text-xs text-gray-500">
                  {connection.isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                leads.isSubscribed ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div>
                <div className="text-sm font-medium text-gray-900">Leads Stream</div>
                <div className="text-xs text-gray-500">
                  {leads.isSubscribed ? `${leads.eventCount} events` : 'Inactive'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                analytics.isSubscribed ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div>
                <div className="text-sm font-medium text-gray-900">Analytics Stream</div>
                <div className="text-xs text-gray-500">
                  {analytics.isSubscribed ? `${analytics.eventCount} events` : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* System Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthMetrics.map((metric) => (
            <motion.div
              key={metric.id}
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getMetricIcon(metric.id)}
                    <span className="text-sm font-medium text-gray-900">
                      {metric.name}
                    </span>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>

                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {typeof metric.value === 'number' ? metric.value.toFixed(metric.id === 'error_rate' ? 2 : 1) : metric.value}
                  </span>
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                  {getTrendIcon(metric.trend)}
                </div>

                {/* Mini Chart */}
                <div className="flex items-end space-x-1 h-8 mb-2">
                  {metric.history.map((value, index) => (
                    <div
                      key={index}
                      className="bg-blue-200 rounded-sm flex-1 min-h-[2px]"
                      style={{
                        height: `${Math.max((value / Math.max(...metric.history)) * 100, 10)}%`,
                      }}
                    />
                  ))}
                </div>

                <div className="text-xs text-gray-400">
                  Updated {metric.lastUpdated.toLocaleTimeString()}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Services Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600">{statusCounts.online} Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-gray-600">{statusCounts.degraded} Degraded</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-600">{statusCounts.offline} Offline</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {systemServices.map((service) => (
            <motion.div
              key={service.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(service.status)}
                <div>
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-500">
                    {service.version && `v${service.version} • `}
                    Uptime: {formatUptime(service.uptime)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{formatDuration(service.responseTime)}</div>
                  <div className="text-gray-500">Response</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{service.errorRate}%</div>
                  <div className="text-gray-500">Error Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">
                    {service.lastCheck.toLocaleTimeString()}
                  </div>
                  <div className="text-gray-500">Last Check</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Alerts & Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Recommendations</h3>
        <div className="space-y-3">
          {healthMetrics.filter(m => m.status !== 'healthy').map((metric) => (
            <div
              key={metric.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                metric.status === 'critical' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
              }`}
            >
              {metric.status === 'critical' ?
                <XCircle className="w-5 h-5" /> :
                <AlertTriangle className="w-5 h-5" />
              }
              <div>
                <div className="font-medium">
                  {metric.name} is {metric.status === 'critical' ? 'critically high' : 'elevated'}
                </div>
                <div className="text-sm opacity-80">
                  Current: {metric.value.toFixed(1)}{metric.unit} •
                  Threshold: {metric.status === 'critical' ? metric.threshold.critical : metric.threshold.warning}{metric.unit}
                </div>
              </div>
            </div>
          ))}

          {systemServices.filter(s => s.status !== 'online').map((service) => (
            <div
              key={service.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                service.status === 'offline' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
              }`}
            >
              {service.status === 'offline' ?
                <XCircle className="w-5 h-5" /> :
                <AlertTriangle className="w-5 h-5" />
              }
              <div>
                <div className="font-medium">
                  {service.name} is {service.status}
                </div>
                <div className="text-sm opacity-80">
                  Response time: {formatDuration(service.responseTime)} •
                  Error rate: {service.errorRate}%
                </div>
              </div>
            </div>
          ))}

          {healthMetrics.every(m => m.status === 'healthy') && systemServices.every(s => s.status === 'online') && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 text-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <div>
                <div className="font-medium">All systems operational</div>
                <div className="text-sm opacity-80">
                  No active alerts or issues detected
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SystemHealth;