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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { 
  useRealtimeConnection, 
  useRealtimeAdminDashboard,
  useRealtimePerformance 
} from '../hooks';
import { ConnectionState } from '../connection-manager';

// Connection status indicator
function ConnectionStatusIndicator() {
  const connection = useRealtimeConnection();
  
  const getStatusColor = () => {
    switch (connection.state) {
      case ConnectionState.CONNECTED:
        return 'bg-green-500';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'bg-yellow-500';
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
