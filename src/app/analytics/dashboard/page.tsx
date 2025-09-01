import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorFallback } from '@/components/ui/error-fallback';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import {
  useABTestingResults,
  useAnalyticsDashboard,
  useCohortAnalysis,
  useConversionFunnel,
  usePredictiveMetrics,
  useUserJourney} from '@/modules/analytics/application/hooks';
import {
  ABTestingWidget,
  AnalyticsDashboardContainer,
  CohortAnalysisWidget,
  ConversionFunnelWidget,
  CustomReportBuilder,
  PredictiveMetricsWidget,
  UserJourneyWidget} from '@/modules/analytics/ui/components';

export default function AnalyticsDashboardPage() {
  const dashboardData = useAnalyticsDashboard();
  const conversionFunnelData = useConversionFunnel();
  const cohortData = useCohortAnalysis();
  const abTestData = useABTestingResults();
  const userJourneyData = useUserJourney();
  const predictiveData = usePredictiveMetrics();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ConversionFunnelWidget data={conversionFunnelData} />
            <CohortAnalysisWidget data={cohortData} />
            <ABTestingWidget data={abTestData} />
            <UserJourneyWidget data={userJourneyData} />
            <PredictiveMetricsWidget data={predictiveData} />
          </div>

          <CustomReportBuilder />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}