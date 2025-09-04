/**
 * Analytics Reports Component
 *
 * Comprehensive analytics dashboard with charts, user activity tracking,
 * conversion funnels, and detailed reporting capabilities.
 */

'use client';

import React, { useMemo,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  Eye,
  Filter,
  Globe,
  MapPin,
  Monitor,
  MousePointer,
  PieChart,
  RefreshCw,
  Share2,
  Smartphone,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Zap} from 'lucide-react';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { LoadingSkeleton } from '@/modules/shared/presentation/components/ui/loading-skeleton';
import { Select } from '@/modules/shared/presentation/components/ui/select';
import { Tabs } from '@/modules/shared/presentation/components/ui/tabs';
// Import API hooks
import {
  useGetConversionFunnelQuery,
  useGetDashboardMetricsQuery,
  useGetEventsQuery,
  useGetUserJourneyQuery,
} from '@/store/api';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    visits: number;
    percentage: number;
  }>;
  funnelData: Array<{
    step: string;
    visitors: number;
    conversionRate: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    pageViews: number;
    visitors: number;
    conversions: number;
  }>;
}

const mockAnalyticsData: AnalyticsData = {
  pageViews: 15420,
  uniqueVisitors: 8930,
  bounceRate: 32.5,
  avgSessionDuration: 245,
  conversions: 412,
  conversionRate: 4.6,
  topPages: [
    { page: '/', views: 8430, uniqueViews: 5820 },
    { page: '/onboarding/business', views: 3240, uniqueViews: 2890 },
    { page: '/onboarding/integration', views: 1890, uniqueViews: 1650 },
    { page: '/pricing', views: 980, uniqueViews: 780 },
    { page: '/onboarding/testing', views: 580, uniqueViews: 520 },
  ],
  deviceBreakdown: {
    desktop: 45.2,
    mobile: 42.8,
    tablet: 12.0,
  },
  trafficSources: [
    { source: 'Direct', visits: 3567, percentage: 39.9 },
    { source: 'Organic Search', visits: 2834, percentage: 31.7 },
    { source: 'Social Media', visits: 1456, percentage: 16.3 },
    { source: 'Referrals', visits: 743, percentage: 8.3 },
    { source: 'Email', visits: 330, percentage: 3.7 },
  ],
  geographicData: [
    { country: 'Nigeria', visits: 2456, percentage: 27.5 },
    { country: 'South Africa', visits: 1789, percentage: 20.0 },
    { country: 'Kenya', visits: 1234, percentage: 13.8 },
    { country: 'Ghana', visits: 987, percentage: 11.1 },
    { country: 'Morocco', visits: 654, percentage: 7.3 },
  ],
  funnelData: [
    { step: 'Landing Page', visitors: 8930, conversionRate: 100 },
    { step: 'Sign Up Form', visitors: 5842, conversionRate: 65.4 },
    { step: 'Business Info', visitors: 4756, conversionRate: 81.4 },
    { step: 'Phone Verification', visitors: 3234, conversionRate: 68.0 },
    { step: 'WhatsApp Integration', visitors: 2187, conversionRate: 67.6 },
    { step: 'Bot Configuration', visitors: 1456, conversionRate: 66.6 },
    { step: 'Testing Complete', visitors: 892, conversionRate: 61.3 },
    { step: 'Onboarding Complete', visitors: 412, conversionRate: 46.2 },
  ],
  timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pageViews: Math.floor(Math.random() * 200) + 400,
    visitors: Math.floor(Math.random() * 150) + 250,
    conversions: Math.floor(Math.random() * 20) + 10,
  })),
};

export const AnalyticsReports = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'pageViews' | 'visitors' | 'conversions'>('pageViews');
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'behavior' | 'sources'>('overview');

  // Mock data - replace with actual API calls
  const analyticsData = mockAnalyticsData;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
      <div className={`flex items-center space-x-1 text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        <Icon className="w-3 h-3" />
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Reports</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics and user behavior insights
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange as any}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </Select>

          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            {getChangeIndicator(analyticsData.pageViews, analyticsData.pageViews * 0.9)}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(analyticsData.pageViews)}
          </div>
          <div className="text-sm text-gray-600">Page Views</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            {getChangeIndicator(analyticsData.uniqueVisitors, analyticsData.uniqueVisitors * 0.85)}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(analyticsData.uniqueVisitors)}
          </div>
          <div className="text-sm text-gray-600">Unique Visitors</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            {getChangeIndicator(analyticsData.conversionRate, analyticsData.conversionRate * 1.1)}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPercentage(analyticsData.conversionRate)}
          </div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            {getChangeIndicator(analyticsData.avgSessionDuration, analyticsData.avgSessionDuration * 0.95)}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatDuration(analyticsData.avgSessionDuration)}
          </div>
          <div className="text-sm text-gray-600">Avg Session Duration</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'funnel', label: 'Conversion Funnel', icon: Target },
            { id: 'behavior', label: 'User Behavior', icon: MousePointer },
            { id: 'sources', label: 'Traffic Sources', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                <div className="space-y-4">
                  {analyticsData.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {page.page === '/' ? 'Home Page' : page.page}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatNumber(page.uniqueViews)} unique views
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatNumber(page.views)}
                        </div>
                        <div className="text-sm text-gray-500">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Device Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(analyticsData.deviceBreakdown).map(([device, percentage]) => {
                    const Icon = device === 'desktop' ? Monitor : device === 'mobile' ? Smartphone : Users;
                    return (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-500" />
                          <span className="capitalize text-gray-900">{device}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {formatPercentage(percentage)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'funnel' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
              <div className="space-y-4">
                {analyticsData.funnelData.map((step, index) => {
                  const isFirst = index === 0;
                  const isLast = index === analyticsData.funnelData.length - 1;
                  const dropOff = index > 0 ? analyticsData.funnelData[index - 1].visitors - step.visitors : 0;

                  return (
                    <motion.div
                      key={step.step}
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0 w-8 text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isLast ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{step.step}</div>
                              {dropOff > 0 && (
                                <div className="text-sm text-red-600">
                                  -{formatNumber(dropOff)} visitors dropped off
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatNumber(step.visitors)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatPercentage(step.conversionRate)} conversion
                              </div>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  isLast ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${step.conversionRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {!isLast && (
                        <div className="flex justify-center mt-2">
                          <div className="w-px h-4 bg-gray-300" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          )}

          {activeTab === 'behavior' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bounce Rate */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatPercentage(analyticsData.bounceRate)}
                    </div>
                    <div className="text-sm text-gray-600">Bounce Rate</div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${analyticsData.bounceRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-2">Session Quality Indicators</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Pages per session</span>
                        <span className="text-sm font-medium">3.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Return visitors</span>
                        <span className="text-sm font-medium">24.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Goal completions</span>
                        <span className="text-sm font-medium">412</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Geographic Data */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                <div className="space-y-3">
                  {analyticsData.geographicData.map((country) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{country.country}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${country.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-16 text-right">
                          {formatNumber(country.visits)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'sources' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
              <div className="space-y-4">
                {analyticsData.trafficSources.map((source, index) => (
                  <motion.div
                    key={source.source}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        source.source === 'Direct' ? 'bg-blue-500' :
                        source.source === 'Organic Search' ? 'bg-green-500' :
                        source.source === 'Social Media' ? 'bg-purple-500' :
                        source.source === 'Referrals' ? 'bg-orange-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{source.source}</div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage(source.percentage)} of total traffic
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(source.visits)}
                      </div>
                      <div className="text-sm text-gray-500">visits</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsReports;