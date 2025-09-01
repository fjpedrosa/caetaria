/**
 * Admin Dashboard - Main Dashboard Page
 *
 * Comprehensive admin dashboard with real-time monitoring, lead management,
 * onboarding tracking, and system health monitoring capabilities.
 */

'use client';

import React, { useEffect,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Database,
  Download,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  UserCheck,
  Users} from 'lucide-react';

// Import real-time hooks
import {
  useRealtimeAnalytics,
  useRealtimeConnection,
  useRealtimeLeads} from '@/lib/supabase/realtime';
import { Badge } from '@/modules/shared/ui/components/ui/badge';
import { Button } from '@/modules/shared/ui/components/ui/button';
import { Card } from '@/modules/shared/ui/components/ui/card';
import { Input } from '@/modules/shared/ui/components/ui/input';
import { Select } from '@/modules/shared/ui/components/ui/select';
import { Tabs } from '@/modules/shared/ui/components/ui/tabs';
// Import API hooks
import {
  useAnalyticsTracking,
  useDashboardMetrics,
  useGetDashboardMetricsQuery,
  useGetLeadsQuery,
  useLeadManagement
} from '@/store/api';

import { AnalyticsReports } from './components/analytics-reports';
import AuthWrapper from './components/auth-wrapper';
import { ExportManager } from './components/export-manager';
// Dashboard components
import { KPIDashboard } from './components/kpi-dashboard';
import { LeadManagement } from './components/lead-management';
import {
  MobileResponsiveWrapper,
  ResponsiveCard,
  ResponsiveGrid,
  useResponsive
} from './components/mobile-responsive-wrapper';
import { NotificationCenter } from './components/notification-center';
import { OnboardingMonitor } from './components/onboarding-monitor';
import { SystemHealth } from './components/system-health';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Responsive utilities
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Real-time connection management
  const realtimeConnection = useRealtimeConnection();
  const leadsSubscription = useRealtimeLeads();
  const analyticsSubscription = useRealtimeAnalytics();

  // Dashboard data
  const { data: dashboardMetrics, isLoading: metricsLoading } = useGetDashboardMetricsQuery(undefined, {
    pollingInterval: 30000, // Update every 30 seconds
    refetchOnFocus: true,
  });

  const { data: recentLeads, isLoading: leadsLoading } = useGetLeadsQuery({
    limit: 10,
    sort: 'created_at',
    order: 'desc'
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger refetch of all data
      await Promise.all([
        // Add any additional refresh logic here
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real-time notifications handler
  useEffect(() => {
    if (leadsSubscription.latestEvent) {
      const newNotification = {
        id: Date.now(),
        type: 'lead',
        title: 'New Lead Received',
        message: `Lead from ${leadsSubscription.latestEvent.email}`,
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    }
  }, [leadsSubscription.latestEvent]);

  useEffect(() => {
    if (analyticsSubscription.latestEvent) {
      const newNotification = {
        id: Date.now(),
        type: 'analytics',
        title: 'System Event',
        message: `${analyticsSubscription.latestEvent.event_name} occurred`,
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    }
  }, [analyticsSubscription.latestEvent]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System Health', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: Download },
  ];

  return (
    <AuthWrapper requiredRole="analyst" requiredPermissions={['dashboard:read']}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time monitoring and management</p>
            </div>

            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
              {/* Connection Status */}
              {!isMobile && (
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    realtimeConnection.isConnected ? 'bg-green-500' :
                    realtimeConnection.isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {realtimeConnection.isConnected ? 'Connected' :
                     realtimeConnection.isConnecting ? 'Connecting...' : 'Disconnected'}
                  </span>
                </div>
              )}

              {isMobile && (
                <div className={`w-3 h-3 rounded-full ${
                  realtimeConnection.isConnected ? 'bg-green-500' :
                  realtimeConnection.isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              )}

              {/* Notifications */}
              <div className="relative">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                    >
                      {notifications.filter(n => !n.read).length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {!isMobile && <span>Refresh</span>}
              </Button>

              {/* Settings */}
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6">
            <div className={`
              flex overflow-x-auto 
              ${isMobile ? 'space-x-1 pb-2' : 'space-x-1'}
              ${isMobile ? 'scrollbar-hide' : ''}
            `}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 rounded-lg whitespace-nowrap transition-colors
                      ${isMobile ? 'px-3 py-2 min-w-max' : 'px-4 py-2'}
                      ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                    {!isMobile && (
                      <span className="text-sm font-medium">{tab.label}</span>
                    )}
                    {isMobile && (
                      <span className="text-xs font-medium">{tab.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isMobile ? 'px-4 py-4' : isTablet ? 'px-6 py-6' : 'px-8 py-6'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <KPIDashboard
                metrics={dashboardMetrics}
                loading={metricsLoading}
                realtimeData={{
                  connection: realtimeConnection,
                  leads: leadsSubscription,
                  analytics: analyticsSubscription
                }}
              />
            )}

            {activeTab === 'leads' && (
              <LeadManagement />
            )}

            {activeTab === 'onboarding' && (
              <OnboardingMonitor />
            )}

            {activeTab === 'notifications' && (
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={(id) => {
                  setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, read: true } : n)
                  );
                }}
                onClearAll={() => setNotifications([])}
              />
            )}

            {activeTab === 'system' && (
              <SystemHealth
                connection={realtimeConnection}
                leads={leadsSubscription}
                analytics={analyticsSubscription}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsReports />
            )}

            {activeTab === 'reports' && (
              <ExportManager />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </AuthWrapper>
  );
};

export default AdminDashboard;