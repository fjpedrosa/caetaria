/**
 * Real-time Demo Page
 *
 * Comprehensive demo page showcasing the real-time capabilities
 * of the onboarding platform with live data updates.
 */

'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React, { useEffect,useState } from 'react';
import { motion } from 'framer-motion';

import { RealtimeDashboard, useRealtimeAnalytics,useRealtimeConnection, useRealtimeLeads } from '@/lib/supabase/realtime';
import { useGetRealtimeHealthQuery } from '@/store/api/realtime-integration';

export default function RealtimeDemoPage() {
  const [showDashboard, setShowDashboard] = useState(true);

  // Real-time connection status
  const connection = useRealtimeConnection();

  // Real-time data hooks
  const leadsSubscription = useRealtimeLeads();
  const analyticsSubscription = useRealtimeAnalytics();

  // RTK Query health monitoring
  const { data: health, isLoading: healthLoading } = useGetRealtimeHealthQuery(undefined, {
    pollingInterval: 5000, // Poll every 5 seconds
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-time Dashboard Demo
          </h1>
          <p className="text-gray-600">
            Live demonstration of real-time capabilities with Supabase subscriptions
          </p>
        </div>

        {/* Connection Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-lg shadow-sm border p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Connection Status</h3>
              <div className={`w-3 h-3 rounded-full ${
                connection.isConnected ? 'bg-green-500' :
                connection.isConnecting ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
            <div className="text-sm text-gray-600">
              State: <span className="font-medium">{connection.state}</span>
            </div>
            <div className="text-sm text-gray-600">
              Subscriptions: <span className="font-medium">{connection.subscriptionsCount}</span>
            </div>
            {connection.lastHeartbeat && (
              <div className="text-xs text-gray-500 mt-1">
                Last heartbeat: {new Date(connection.lastHeartbeat).toLocaleTimeString()}
              </div>
            )}
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm border p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Leads Subscription</h3>
              <div className={`w-3 h-3 rounded-full ${
                leadsSubscription.isSubscribed ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="text-sm text-gray-600">
              Status: <span className="font-medium">
                {leadsSubscription.isSubscribed ? 'Active' : 'Inactive'}
              </span>
            </div>
            {leadsSubscription.error && (
              <div className="text-xs text-red-600 mt-1">
                Error: {leadsSubscription.error.message}
              </div>
            )}
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm border p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Analytics Stream</h3>
              <div className={`w-3 h-3 rounded-full ${
                analyticsSubscription.isSubscribed ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="text-sm text-gray-600">
              Events: <span className="font-medium">{analyticsSubscription.eventCount}</span>
            </div>
            {analyticsSubscription.latestEvent && (
              <div className="text-xs text-gray-500 mt-1">
                Latest: {analyticsSubscription.latestEvent.event_name}
              </div>
            )}
          </motion.div>
        </div>

        {/* RTK Query Health Status */}
        {!healthLoading && health && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">System Health (RTK Query)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${health.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {health.isConnected ? '' : 'L'}
                </div>
                <div className="text-sm text-gray-500">Connection</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {health.subscriptionsCount}
                </div>
                <div className="text-sm text-gray-500">Subscriptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {health.latency.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-500">Latency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.floor(health.uptime / 1000 / 60)}m
                </div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Demo Controls</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showDashboard ? 'Hide' : 'Show'} Dashboard
            </button>

            <button
              onClick={() => leadsSubscription.reconnect()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={!leadsSubscription.isSubscribed}
            >
              Reconnect Leads
            </button>

            <button
              onClick={() => analyticsSubscription.resetEventCount()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Reset Event Count
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Test Real-time Features</h3>
          <div className="text-blue-800 space-y-2">
            <p>" Open your database admin panel (e.g., Supabase Dashboard)</p>
            <p>" Insert, update, or delete records in the <code className="bg-blue-200 px-1 rounded">leads</code> table</p>
            <p>" Insert new records in the <code className="bg-blue-200 px-1 rounded">analytics_events</code> table</p>
            <p>" Watch the dashboard update in real-time without page refresh</p>
            <p>" Monitor connection status and performance metrics</p>
          </div>
        </div>

        {/* Real-time Dashboard */}
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RealtimeDashboard />
          </motion.div>
        )}

        {/* Developer Information */}
        <div className="bg-gray-100 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Developer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Real-time Components Used</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>" <code>useRealtimeConnection</code> - Connection status</li>
                <li>" <code>useRealtimeLeads</code> - Leads subscription</li>
                <li>" <code>useRealtimeAnalytics</code> - Analytics events</li>
                <li>" <code>RealtimeDashboard</code> - Admin dashboard</li>
                <li>" <code>RTK Query Integration</code> - Cache management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features Demonstrated</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>" WebSocket connection management</li>
                <li>" Automatic reconnection logic</li>
                <li>" Performance monitoring</li>
                <li>" Cache invalidation</li>
                <li>" Optimistic updates</li>
                <li>" Error handling & recovery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}