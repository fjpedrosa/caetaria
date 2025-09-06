/**
 * Real-time Dashboard Component
 *
 * Live dashboard with real-time updates for leads, analytics,
 * and system health monitoring.
 *
 * Features:
 * - Live connection status
 * - Real-time metrics updates
 * - Performance monitoring
 * - Error handling and recovery
 * - Admin controls
 */

'use client';

import React, { useEffect,useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, UserPlus, Users, Zap } from 'lucide-react';

import { ConnectionState } from '../connection-manager';
import {
  useRealtimeAdminDashboard,
  useRealtimeConnection,
  useRealtimePerformance
} from '../hooks';

// Connection status indicator
function ConnectionStatusIndicator() {
  const connection = useRealtimeConnection();

  const getStatusColor = () => {
    switch (connection.state) {
      case ConnectionState.CONNECTED:
        return 'bg-green-500';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'bg-blue-500';
      case ConnectionState.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connection.state) {
      case ConnectionState.CONNECTED:
        return 'Connected';
      case ConnectionState.CONNECTING:
        return 'Connecting...';
      case ConnectionState.RECONNECTING:
        return `Reconnecting... (${connection.reconnectAttempts}/10)`;
      case ConnectionState.ERROR:
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        className={`w-3 h-3 rounded-full ${getStatusColor()}`}
        animate={connection.isConnecting ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      <span className="text-sm font-medium">
        {getStatusText()}
      </span>
      {connection.lastHeartbeat && (
        <span className="text-xs text-gray-500">
          Last ping: {new Date(connection.lastHeartbeat).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

// Performance metrics card
function PerformanceMetrics() {
  const metrics = useRealtimePerformance();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Real-time Performance</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.subscriptionsCount}
          </div>
          <div className="text-sm text-gray-500">Active Subscriptions</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.averageLatency.toFixed(0)}ms
          </div>
          <div className="text-sm text-gray-500">Avg Latency</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.errorRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Error Rate</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.floor(metrics.connectionUptime / 1000 / 60)}m
          </div>
          <div className="text-sm text-gray-500">Uptime</div>
        </div>
      </div>
    </div>
  );
}

// Live stats cards
function LiveStatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        className="bg-white rounded-lg shadow-sm border p-6"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
          </div>
          <div className="text-blue-500">
            <Users className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-lg shadow-sm border p-6"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">New Today</p>
            <p className="text-2xl font-bold text-green-600">{stats.newLeadsToday}</p>
          </div>
          <div className="text-green-500">
            <UserPlus className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-lg shadow-sm border p-6"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Events</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalEvents}</p>
          </div>
          <div className="text-purple-500">
            <Activity className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-lg shadow-sm border p-6"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Events Today</p>
            <p className="text-2xl font-bold text-orange-600">{stats.eventsToday}</p>
          </div>
          <div className="text-orange-500">
            <Zap className="w-8 h-8" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Activity feed component
function ActivityFeed({ latestEvent }: { latestEvent: any }) {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (latestEvent) {
      setActivities(prev => [
        {
          id: latestEvent.id,
          type: latestEvent.event_name,
          timestamp: new Date(latestEvent.created_at),
          data: latestEvent.event_data,
        },
        ...prev.slice(0, 9) // Keep last 10 activities
      ]);
    }
  }, [latestEvent]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Live Activity Feed</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <motion.div
              key={activity.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// Main dashboard component
export function RealtimeDashboard() {
  const dashboard = useRealtimeAdminDashboard();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <p className="text-gray-500">Loading real-time dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Real-time Dashboard</h1>
          <ConnectionStatusIndicator />
        </div>

        {dashboard.hasErrors && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              Connection issues detected.
              <button
                onClick={dashboard.reconnectAll}
                className="ml-2 text-red-700 underline hover:no-underline"
              >
                Reconnect
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Performance metrics */}
      <PerformanceMetrics />

      {/* Live stats cards */}
      <LiveStatsCards stats={dashboard.stats} />

      {/* Activity feed and connection details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed latestEvent={dashboard.analytics.latestEvent} />

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Connection Details</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Connection State</span>
              <span className="text-sm font-medium">
                {dashboard.connection.state}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subscriptions</span>
              <span className="text-sm font-medium">
                {dashboard.connection.subscriptionsCount}
              </span>
            </div>

            {dashboard.connection.connectedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connected Since</span>
                <span className="text-sm font-medium">
                  {dashboard.connection.connectedAt.toLocaleTimeString()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reconnect Attempts</span>
              <span className="text-sm font-medium">
                {dashboard.connection.reconnectAttempts}
              </span>
            </div>
          </div>

          <div className="mt-6 space-x-2">
            <button
              onClick={dashboard.reconnectAll}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              disabled={dashboard.connection.isConnecting}
            >
              {dashboard.connection.isConnecting ? 'Connecting...' : 'Reconnect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealtimeDashboard;