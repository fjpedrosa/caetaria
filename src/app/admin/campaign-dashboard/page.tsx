/**
 * Campaign Performance Dashboard
 * Real-time campaign analytics and attribution tracking
 * Target KPIs: CPL <€50, Conversion Rate >5%, Onboarding >40%
 */

'use client';

import React, { useEffect,useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { Select } from '@/modules/shared/presentation/components/ui/select';
import { Tabs } from '@/modules/shared/presentation/components/ui/tabs';

import { CampaignABTestResults } from '../../../modules/marketing/presentation/components/campaign-ab-test-results';
import { CampaignAttributionChart } from '../../../modules/marketing/presentation/components/campaign-attribution-chart';
import { CampaignFunnelAnalysis } from '../../../modules/marketing/presentation/components/campaign-funnel-analysis';
import { CampaignLeadScoring } from '../../../modules/marketing/presentation/components/campaign-lead-scoring';
import { CampaignMetricsOverview } from '../../../modules/marketing/presentation/components/campaign-metrics-overview';
import { CampaignROIAnalysis } from '../../../modules/marketing/presentation/components/campaign-roi-analysis';

interface CampaignPerformanceData {
  overview: {
    totalSpend: number;
    totalLeads: number;
    costPerLead: number;
    conversionRate: number;
    onboardingCompletion: number;
    targetProgress: {
      cpl: { current: number; target: number; };
      conversion: { current: number; target: number; };
      onboarding: { current: number; target: number; };
    };
  };
  variants: {
    A: {
      visitors: number;
      leads: number;
      conversions: number;
      spend: number;
      cpl: number;
      conversionRate: number;
    };
    B: {
      visitors: number;
      leads: number;
      conversions: number;
      spend: number;
      cpl: number;
      conversionRate: number;
    };
  };
  attribution: {
    sources: Array<{
      source: string;
      medium: string;
      campaign: string;
      leads: number;
      spend: number;
      cpl: number;
      conversionRate: number;
    }>;
  };
  funnel: {
    steps: Array<{
      step: string;
      visitors: number;
      dropoffRate: number;
      conversionRate: number;
    }>;
  };
  leadScoring: {
    distribution: Array<{
      scoreRange: string;
      count: number;
      conversionRate: number;
    }>;
  };
}

export default function CampaignDashboard() {
  const [performanceData, setPerformanceData] = useState<CampaignPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCampaign, setSelectedCampaign] = useState('restaurant_validation_2025_q1');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load campaign performance data
  useEffect(() => {
    const fetchCampaignData = async () => {
      setLoading(true);
      try {
        // Simulate API call - in real implementation, fetch from campaign API
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockData: CampaignPerformanceData = {
          overview: {
            totalSpend: 1250,
            totalLeads: 28,
            costPerLead: 44.64,
            conversionRate: 5.8,
            onboardingCompletion: 42.9,
            targetProgress: {
              cpl: { current: 44.64, target: 50 },
              conversion: { current: 5.8, target: 5.0 },
              onboarding: { current: 42.9, target: 40.0 }
            }
          },
          variants: {
            A: {
              visitors: 243,
              leads: 15,
              conversions: 6,
              spend: 650,
              cpl: 43.33,
              conversionRate: 6.2
            },
            B: {
              visitors: 239,
              leads: 13,
              conversions: 5,
              spend: 600,
              cpl: 46.15,
              conversionRate: 5.4
            }
          },
          attribution: {
            sources: [
              {
                source: 'google',
                medium: 'cpc',
                campaign: 'restaurant_validation_2025_q1',
                leads: 18,
                spend: 800,
                cpl: 44.44,
                conversionRate: 6.1
              },
              {
                source: 'facebook',
                medium: 'cpc',
                campaign: 'restaurant_social_2025_q1',
                leads: 7,
                spend: 350,
                cpl: 50.00,
                conversionRate: 4.9
              },
              {
                source: 'linkedin',
                medium: 'cpc',
                campaign: 'restaurant_b2b_2025_q1',
                leads: 3,
                spend: 100,
                cpl: 33.33,
                conversionRate: 8.1
              }
            ]
          },
          funnel: {
            steps: [
              { step: 'Landing Page View', visitors: 482, dropoffRate: 0, conversionRate: 100 },
              { step: 'Engaged (>30s)', visitors: 298, dropoffRate: 38.2, conversionRate: 61.8 },
              { step: 'Scroll >50%', visitors: 186, dropoffRate: 37.6, conversionRate: 38.6 },
              { step: 'CTA Click', visitors: 97, dropoffRate: 47.8, conversionRate: 20.1 },
              { step: 'Form Start', visitors: 45, dropoffRate: 53.6, conversionRate: 9.3 },
              { step: 'Lead Submit', visitors: 28, dropoffRate: 37.8, conversionRate: 5.8 },
              { step: 'Onboarding Start', visitors: 18, dropoffRate: 35.7, conversionRate: 3.7 },
              { step: 'Onboarding Complete', visitors: 12, dropoffRate: 33.3, conversionRate: 2.5 }
            ]
          },
          leadScoring: {
            distribution: [
              { scoreRange: '0-25', count: 8, conversionRate: 12.5 },
              { scoreRange: '26-50', count: 12, conversionRate: 33.3 },
              { scoreRange: '51-75', count: 6, conversionRate: 66.7 },
              { scoreRange: '76-100', count: 2, conversionRate: 100.0 }
            ]
          }
        };

        setPerformanceData(mockData);
      } catch (error) {
        console.error('Failed to fetch campaign data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();

    // Auto refresh setup
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(fetchCampaignData, 300000); // 5 minutes
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [timeRange, selectedCampaign, autoRefresh]);

  const handleExportData = () => {
    if (performanceData) {
      const exportData = {
        ...performanceData,
        exportedAt: new Date().toISOString(),
        timeRange,
        campaign: selectedCampaign,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-performance-${selectedCampaign}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getKPIStatus = (current: number, target: number, isLowerBetter: boolean = false) => {
    const difference = current - target;
    const isOnTarget = isLowerBetter ? current <= target : current >= target;

    return {
      isOnTarget,
      difference: Math.abs(difference),
      percentage: Math.abs((difference / target) * 100),
      color: isOnTarget ? 'text-green-600' : 'text-red-600',
      bgColor: isOnTarget ? 'bg-green-50' : 'bg-red-50',
      icon: isOnTarget ? TrendingUp : Target,
    };
  };

  if (loading || !performanceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading campaign performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Performance Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time validation campaign analytics</p>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </Select>

              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <option value="restaurant_validation_2025_q1">Restaurant Validation Q1</option>
                <option value="dental_validation_2025_q1">Dental Validation Q1</option>
                <option value="childcare_validation_2025_q1">Childcare Validation Q1</option>
              </Select>

              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>

              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Cost Per Lead KPI */}
          {(() => {
            const cplStatus = getKPIStatus(
              performanceData.overview.targetProgress.cpl.current,
              performanceData.overview.targetProgress.cpl.target,
              true
            );
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className={`p-6 ${cplStatus.bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge className={cplStatus.color}>
                      {cplStatus.isOnTarget ? 'On Target' : 'Off Target'}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-gray-900">
                      €{performanceData.overview.costPerLead.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Cost Per Lead</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target: €{performanceData.overview.targetProgress.cpl.target}</span>
                    <span className={cplStatus.color}>
                      {cplStatus.isOnTarget ? '✓' : `${cplStatus.difference.toFixed(2)} over`}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })()}

          {/* Conversion Rate KPI */}
          {(() => {
            const conversionStatus = getKPIStatus(
              performanceData.overview.targetProgress.conversion.current,
              performanceData.overview.targetProgress.conversion.target
            );
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`p-6 ${conversionStatus.bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <Badge className={conversionStatus.color}>
                      {conversionStatus.isOnTarget ? 'On Target' : 'Off Target'}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {performanceData.overview.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target: {performanceData.overview.targetProgress.conversion.target}%</span>
                    <span className={conversionStatus.color}>
                      {conversionStatus.isOnTarget ? '✓' : `${conversionStatus.percentage.toFixed(1)}% above target`}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })()}

          {/* Onboarding Completion KPI */}
          {(() => {
            const onboardingStatus = getKPIStatus(
              performanceData.overview.targetProgress.onboarding.current,
              performanceData.overview.targetProgress.onboarding.target
            );
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className={`p-6 ${onboardingStatus.bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <Badge className={onboardingStatus.color}>
                      {onboardingStatus.isOnTarget ? 'On Target' : 'Off Target'}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {performanceData.overview.onboardingCompletion.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Onboarding Completion</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target: {performanceData.overview.targetProgress.onboarding.target}%</span>
                    <span className={onboardingStatus.color}>
                      {onboardingStatus.isOnTarget ? '✓' : `${onboardingStatus.percentage.toFixed(1)}% above target`}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })()}
        </div>

        {/* Main Analytics Components */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Overview
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                A/B Testing
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Attribution
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Funnel Analysis
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Lead Scoring
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                ROI Analysis
              </button>
            </nav>
          </div>

          <div className="mt-6 space-y-6">
            <CampaignMetricsOverview data={performanceData} />
            <CampaignABTestResults data={performanceData.variants} />
            <CampaignAttributionChart data={performanceData.attribution} />
            <CampaignFunnelAnalysis data={performanceData.funnel} />
            <CampaignLeadScoring data={performanceData.leadScoring} />
            <CampaignROIAnalysis data={performanceData} />
          </div>
        </Tabs>
      </div>
    </div>
  );
}