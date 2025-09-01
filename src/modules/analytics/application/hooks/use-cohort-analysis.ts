import { useEffect,useState } from 'react';

import {
  CohortAnalyticsService
} from '@/modules/analytics/infrastructure/services/cohort-analytics.service';

export interface CohortData {
  cohortId: string;
  retentionRates: number[];
  createdAt: Date;
}

export const useCohortAnalysis = (
  startDate?: Date,
  endDate?: Date
) => {
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCohortData = async () => {
      try {
        setLoading(true);
        const service = new CohortAnalyticsService();
        const data = await service.getCohortRetention(startDate, endDate);
        setCohortData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCohortData();
  }, [startDate, endDate]);

  return {
    cohortData,
    loading,
    error
  };
};