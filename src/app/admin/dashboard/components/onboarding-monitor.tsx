/**
 * Onboarding Monitor Component
 *
 * Real-time monitoring of onboarding sessions with step-by-step tracking,
 * completion analytics, and bottleneck identification.
 */

'use client';

import React, { useMemo,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Building,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  MessageSquare,
  Pause,
  Phone,
  PieChart,
  Play,
  RefreshCw,
  TestTube,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  XCircle} from 'lucide-react';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { LoadingSkeleton } from '@/modules/shared/presentation/components/ui/loading-skeleton';
import { Select } from '@/modules/shared/presentation/components/ui/select';
import { Tabs } from '@/modules/shared/presentation/components/ui/tabs';
// Import API hooks
import {
  useGetDashboardMetricsQuery,
  useGetOnboardingDataQuery,
  useGetOnboardingSessionQuery} from '@/store/api';

interface OnboardingStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  duration?: number;
  error_message?: string;
}

interface OnboardingSession {
  id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  current_step: string;
  steps: OnboardingStep[];
  started_at: string;
  completed_at?: string;
  total_duration?: number;
  last_activity: string;
}

const stepIcons = {
  business: Building,
  phone: Phone,
  integration: MessageSquare,
  bot: TestTube,
  testing: Activity,
  complete: Trophy,
};

const statusColors = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  abandoned: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export const OnboardingMonitor = () => {
  const [activeView, setActiveView] = useState<'sessions' | 'analytics'>('sessions');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  const mockSessions: OnboardingSession[] = [
    {
      id: '1',
      user_id: '1',
      user_email: 'john@example.com',
      user_name: 'John Smith',
      status: 'in_progress',
      current_step: 'integration',
      steps: [
        { id: 'business', name: 'Business Information', status: 'completed', started_at: '2024-01-15T10:00:00Z', completed_at: '2024-01-15T10:05:00Z', duration: 300 },
        { id: 'phone', name: 'Phone Verification', status: 'completed', started_at: '2024-01-15T10:05:00Z', completed_at: '2024-01-15T10:08:00Z', duration: 180 },
        { id: 'integration', name: 'WhatsApp Integration', status: 'in_progress', started_at: '2024-01-15T10:08:00Z' },
        { id: 'bot', name: 'Bot Configuration', status: 'pending' },
        { id: 'testing', name: 'Testing', status: 'pending' },
        { id: 'complete', name: 'Complete', status: 'pending' },
      ],
      started_at: '2024-01-15T10:00:00Z',
      last_activity: '2024-01-15T10:15:00Z',
    },
    {
      id: '2',
      user_id: '2',
      user_email: 'jane@company.com',
      user_name: 'Jane Doe',
      status: 'completed',
      current_step: 'complete',
      steps: [
        { id: 'business', name: 'Business Information', status: 'completed', started_at: '2024-01-15T09:00:00Z', completed_at: '2024-01-15T09:03:00Z', duration: 180 },
        { id: 'phone', name: 'Phone Verification', status: 'completed', started_at: '2024-01-15T09:03:00Z', completed_at: '2024-01-15T09:05:00Z', duration: 120 },
        { id: 'integration', name: 'WhatsApp Integration', status: 'completed', started_at: '2024-01-15T09:05:00Z', completed_at: '2024-01-15T09:12:00Z', duration: 420 },
        { id: 'bot', name: 'Bot Configuration', status: 'completed', started_at: '2024-01-15T09:12:00Z', completed_at: '2024-01-15T09:18:00Z', duration: 360 },
        { id: 'testing', name: 'Testing', status: 'completed', started_at: '2024-01-15T09:18:00Z', completed_at: '2024-01-15T09:20:00Z', duration: 120 },
        { id: 'complete', name: 'Complete', status: 'completed', started_at: '2024-01-15T09:20:00Z', completed_at: '2024-01-15T09:20:00Z', duration: 0 },
      ],
      started_at: '2024-01-15T09:00:00Z',
      completed_at: '2024-01-15T09:20:00Z',
      total_duration: 1200,
      last_activity: '2024-01-15T09:20:00Z',
    }
  ];

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (statusFilter === 'all') return mockSessions;
    return mockSessions.filter(session => session.status === statusFilter);
  }, [statusFilter]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = mockSessions.length;
    const completed = mockSessions.filter(s => s.status === 'completed').length;
    const inProgress = mockSessions.filter(s => s.status === 'in_progress').length;
    const abandoned = mockSessions.filter(s => s.status === 'abandoned').length;

    const completedSessions = mockSessions.filter(s => s.status === 'completed');
    const avgDuration = completedSessions.length > 0
      ? completedSessions.reduce((acc, s) => acc + (s.total_duration || 0), 0) / completedSessions.length
      : 0;

    // Step completion rates
    const stepStats = {
      business: { completed: 0, failed: 0, total: 0 },
      phone: { completed: 0, failed: 0, total: 0 },
      integration: { completed: 0, failed: 0, total: 0 },
      bot: { completed: 0, failed: 0, total: 0 },
      testing: { completed: 0, failed: 0, total: 0 },
    };

    mockSessions.forEach(session => {
      session.steps.forEach(step => {
        if (stepStats[step.id as keyof typeof stepStats]) {
          stepStats[step.id as keyof typeof stepStats].total++;
          if (step.status === 'completed') {
            stepStats[step.id as keyof typeof stepStats].completed++;
          } else if (step.status === 'failed') {
            stepStats[step.id as keyof typeof stepStats].failed++;
          }
        }
      });
    });

    return {
      total,
      completed,
      inProgress,
      abandoned,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      avgDuration: Math.round(avgDuration / 60), // Convert to minutes
      stepStats,
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStepIcon = (stepId: string) => {
    const Icon = stepIcons[stepId as keyof typeof stepIcons] || Activity;
    return Icon;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Onboarding Monitor</h2>
          <p className="text-gray-600 mt-1">Real-time tracking of user onboarding sessions</p>
        </div>

        <div className="flex items-center space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">All Sessions</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </Select>

          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.completionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Duration</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.avgDuration}min</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.inProgress}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView as any}>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveView('sessions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Sessions ({analytics.inProgress})
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Step Analytics
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeView === 'sessions' && (
            <div className="space-y-6">
              {/* Sessions List */}
              <div className="grid gap-6">
                <AnimatePresence>
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-gray-500" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {session.user_name || session.user_email}
                              </h3>
                              <p className="text-sm text-gray-500">{session.user_email}</p>
                              <p className="text-xs text-gray-400">Started: {formatTimestamp(session.started_at)}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Badge className={statusColors[session.status]}>
                              {session.status.replace('_', ' ')}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {selectedSession === session.id ? 'Hide' : 'View'} Details
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-900">
                              {session.steps.filter(s => s.status === 'completed').length} / {session.steps.length} steps
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(session.steps.filter(s => s.status === 'completed').length / session.steps.length) * 100}%`
                              }}
                            />
                          </div>
                        </div>

                        {/* Steps Overview */}
                        <div className="flex items-center justify-between">
                          {session.steps.map((step, index) => {
                            const Icon = getStepIcon(step.id);
                            return (
                              <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  step.status === 'completed' ? 'bg-green-100 text-green-600' :
                                  step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                  step.status === 'failed' ? 'bg-red-100 text-red-600' :
                                  'bg-gray-100 text-gray-400'
                                }`}>
                                  {step.status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : step.status === 'failed' ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : step.status === 'in_progress' ? (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                  ) : (
                                    <Icon className="w-4 h-4" />
                                  )}
                                </div>
                                {index < session.steps.length - 1 && (
                                  <div className={`w-8 h-px mx-2 ${
                                    step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                                  }`} />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed Steps View */}
                        <AnimatePresence>
                          {selectedSession === session.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 pt-6 border-t border-gray-200"
                            >
                              <h4 className="text-lg font-medium text-gray-900 mb-4">Step Details</h4>
                              <div className="space-y-3">
                                {session.steps.map((step) => {
                                  const Icon = getStepIcon(step.id);
                                  return (
                                    <div key={step.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-3">
                                        <Icon className="w-5 h-5 text-gray-500" />
                                        <div>
                                          <div className="font-medium text-gray-900">{step.name}</div>
                                          {step.started_at && (
                                            <div className="text-sm text-gray-500">
                                              Started: {formatTimestamp(step.started_at)}
                                              {step.completed_at && (
                                                <> • Duration: {formatDuration(step.duration || 0)}</>
                                              )}
                                            </div>
                                          )}
                                          {step.error_message && (
                                            <div className="text-sm text-red-600">
                                              Error: {step.error_message}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Badge className={statusColors[step.status]}>
                                        {step.status.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="space-y-6">
              {/* Step Completion Rates */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Step Completion Analysis</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.stepStats).map(([stepId, stats]) => {
                    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                    const Icon = getStepIcon(stepId);

                    return (
                      <div key={stepId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {stepId.charAt(0).toUpperCase() + stepId.slice(1)} Step
                            </div>
                            <div className="text-sm text-gray-500">
                              {stats.completed} completed, {stats.failed} failed, {stats.total} total
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <div className="text-sm font-medium text-gray-900 w-12 text-right">
                            {completionRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default OnboardingMonitor;