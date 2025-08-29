'use client';

import React, { useMemo,useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  Calendar,
  Download, 
  Eye, 
  MousePointer, 
  RefreshCw,
  TrendingDown, 
  TrendingUp, 
  Users} from 'lucide-react';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/loading-skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { 
  useGetEventStatsQuery,
  useGetMetricsQuery, 
  useGetMetricTrendQuery 
} from '../../infra/services/analytics-api';

interface MetricsDashboardProps {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  refreshInterval?: number; // milliseconds
  showRealTime?: boolean;
  compactMode?: boolean;
}

export function MetricsDashboard({ 
  dateRange, 
  refreshInterval = 30000, 
  showRealTime = true,
  compactMode = false 
}: MetricsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d' | 'custom'>('24h');
  const [selectedMetricType, setSelectedMetricType] = useState<'all' | 'performance' | 'user' | 'business'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate date range based on timeframe
  const calculatedDateRange = useMemo(() => {
    if (dateRange) return dateRange;

    const endDate = new Date();
    const startDate = new Date();

    switch (selectedTimeframe) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    return { startDate, endDate };
  }, [dateRange, selectedTimeframe]);

  // API queries
  const { 
    data: metricsData, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useGetMetricsQuery({
    startDate: calculatedDateRange.startDate,
    endDate: calculatedDateRange.endDate,
    limit: compactMode ? 6 : 12,
  }, {
    pollingInterval: showRealTime ? refreshInterval : undefined,
  });

  const { 
    data: eventStats, 
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useGetEventStatsQuery({
    startDate: calculatedDateRange.startDate,
    endDate: calculatedDateRange.endDate,
  }, {
    pollingInterval: showRealTime ? refreshInterval : undefined,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchMetrics(),
        refetchStats(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    if (metricsData && eventStats) {
      const data = {
        metrics: metricsData,
        eventStats,
        dateRange: calculatedDateRange,
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedTimeframe}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getMetricIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('user')) return Users;
    if (lowerName.includes('page') || lowerName.includes('view')) return Eye;
    if (lowerName.includes('click') || lowerName.includes('interaction')) return MousePointer;
    if (lowerName.includes('performance') || lowerName.includes('load')) return Activity;
    return BarChart3;
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return TrendingUp;
      case 'decreasing': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const filteredMetrics = useMemo(() => {
    if (!metricsData?.metrics || selectedMetricType === 'all') {
      return metricsData?.metrics || [];
    }

    return metricsData.metrics.filter(metric => {
      const name = metric.name.toLowerCase();
      const tags = metric.tags.map(tag => tag.toLowerCase());
      
      switch (selectedMetricType) {
        case 'performance':
          return name.includes('performance') || name.includes('load') || tags.includes('performance');
        case 'user':
          return name.includes('user') || name.includes('session') || tags.includes('user');
        case 'business':
          return name.includes('conversion') || name.includes('revenue') || tags.includes('business');
        default:
          return true;
      }
    });
  }, [metricsData?.metrics, selectedMetricType]);

  if (metricsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (metricsError || !metricsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive">Failed to load metrics data. Please try again.</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            {calculatedDateRange.startDate.toLocaleDateString()} - {calculatedDateRange.endDate.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMetricType} onValueChange={(value) => setSelectedMetricType(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Stats Overview */}
      {eventStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Events tracked in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.uniqueSessions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                User sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Events/User</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventStats.uniqueUsers > 0 
                  ? (eventStats.totalEvents / eventStats.uniqueUsers).toFixed(1)
                  : '0'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Engagement rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMetrics.map((metric) => {
          const IconComponent = getMetricIcon(metric.name);
          
          return (
            <Card key={metric.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {metric.description}
                  </CardDescription>
                </div>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {metric.value.data.formatted}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {metric.type}
                    </Badge>
                    
                    {metric.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {metric.source && (
                    <p className="text-xs text-muted-foreground">
                      Source: {metric.source}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Events */}
      {eventStats?.eventsByType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Events</CardTitle>
            <CardDescription>
              Most frequent events by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(eventStats.eventsByType)
                .sort(([, a], [, b]) => b - a)
                .slice(0, compactMode ? 5 : 10)
                .map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium capitalize">
                        {eventType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(eventStats.eventsByType))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {metricsData.aggregations && Object.keys(metricsData.aggregations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metrics Summary</CardTitle>
            <CardDescription>
              Aggregated metrics overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metricsData.aggregations).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {key}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}