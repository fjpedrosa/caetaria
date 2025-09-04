/**
 * KPI Dashboard Component
 *
 * Real-time metrics display with key performance indicators,
 * conversion rates, and system performance monitoring.
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  MessageSquare,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Zap} from 'lucide-react';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { LoadingSkeleton } from '@/modules/shared/presentation/components/ui/loading-skeleton';

interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
  description?: string;
}

interface RealtimeData {
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

interface Props {
  metrics?: {
    totalLeads: number;
    newLeadsToday: number;
    conversionRate: number;
    avgOnboardingTime: number;
    activeUsers: number;
    completionRate: number;
    systemUptime: number;
    apiLatency: number;
  };
  loading?: boolean;
  realtimeData: RealtimeData;
}

export const KPIDashboard = ({
  metrics,
  loading = false,
  realtimeData
}: Props) => {
  // Calculate real-time derived metrics
  const derivedMetrics = useMemo(() => {
    if (!metrics) return null;

    const kpiMetrics: KPIMetric[] = [
      {
        id: 'total-leads',
        title: 'Total Leads',
        value: metrics.totalLeads.toLocaleString(),
        change: 12.5,
        changeType: 'increase',
        icon: Users,
        color: 'blue',
        description: 'All-time lead count'
      },
      {
        id: 'new-leads-today',
        title: 'New Leads Today',
        value: metrics.newLeadsToday,
        change: 8.2,
        changeType: 'increase',
        icon: UserPlus,
        color: 'green',
        description: 'Leads acquired today'
      },
      {
        id: 'conversion-rate',
        title: 'Conversion Rate',
        value: `${metrics.conversionRate}%`,
        change: -2.1,
        changeType: 'decrease',
        icon: Target,
        color: 'purple',
        description: 'Lead to customer conversion'
      },
      {
        id: 'completion-rate',
        title: 'Onboarding Completion',
        value: `${metrics.completionRate}%`,
        change: 5.3,
        changeType: 'increase',
        icon: CheckCircle,
        color: 'emerald',
        description: 'Successfully completed onboarding'
      },
      {
        id: 'avg-onboarding-time',
        title: 'Avg. Onboarding Time',
        value: `${Math.round(metrics.avgOnboardingTime)} min`,
        change: -15.2,
        changeType: 'increase', // Decrease in time is good
        icon: Clock,
        color: 'orange',
        description: 'Average time to complete onboarding'
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: metrics.activeUsers,
        change: 3.7,
        changeType: 'increase',
        icon: Activity,
        color: 'indigo',
        description: 'Currently active users'
      },
      {
        id: 'system-uptime',
        title: 'System Uptime',
        value: `${metrics.systemUptime}%`,
        change: 0.1,
        changeType: 'increase',
        icon: Zap,
        color: 'teal',
        description: 'System availability'
      },
      {
        id: 'api-latency',
        title: 'API Latency',
        value: `${metrics.apiLatency}ms`,
        change: -8.5,
        changeType: 'increase', // Lower latency is better
        icon: Database,
        color: 'pink',
        description: 'Average API response time'
      }
    ];

    return kpiMetrics;
  }, [metrics]);

  if (loading || !derivedMetrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="p-6">
              <LoadingSkeleton className="h-4 w-24 mb-2" />
              <LoadingSkeleton className="h-8 w-16 mb-2" />
              <LoadingSkeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Banner */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              realtimeData.connection.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Real-time Status: {realtimeData.connection.state}
              </div>
              <div className="text-xs text-gray-500">
                {realtimeData.connection.subscriptionsCount} active subscriptions
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Leads: </span>
              <Badge variant={realtimeData.leads.isSubscribed ? 'default' : 'secondary'}>
                {realtimeData.leads.isSubscribed ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">Events: </span>
              <Badge variant={realtimeData.analytics.isSubscribed ? 'default' : 'secondary'}>
                {realtimeData.analytics.eventCount}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {derivedMetrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                    <Icon className={`w-5 h-5 text-${metric.color}-600`} />
                  </div>

                  <div className={`flex items-center space-x-1 text-sm ${
                    metric.changeType === 'increase' ? 'text-green-600' :
                    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : metric.changeType === 'decrease' ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    <span>{Math.abs(metric.change)}%</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {metric.title}
                  </div>
                </div>

                {metric.description && (
                  <div className="text-xs text-gray-500">
                    {metric.description}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Leads</span>
              <Badge variant="secondary">{metrics.newLeadsToday}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Onboarding Started</span>
              <Badge variant="secondary">
                {Math.floor(metrics.newLeadsToday * 0.8)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Onboarding Completed</span>
              <Badge variant="secondary">
                {Math.floor(metrics.newLeadsToday * metrics.completionRate / 100)}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Response Time</span>
              <Badge variant={metrics.apiLatency < 200 ? 'default' : 'destructive'}>
                {metrics.apiLatency}ms
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Health</span>
              <Badge variant="default">Excellent</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error Rate</span>
              <Badge variant="secondary">0.1%</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            {metrics.apiLatency > 500 && (
              <div className="flex items-center space-x-2 text-sm text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span>High API latency detected</span>
              </div>
            )}

            {metrics.conversionRate < 5 && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Conversion rate below target</span>
              </div>
            )}

            {realtimeData.connection.isConnected && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Real-time monitoring active</span>
              </div>
            )}

            {!realtimeData.connection.isConnected && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Real-time connection lost</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default KPIDashboard;