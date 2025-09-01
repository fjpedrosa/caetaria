import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type ReportMetric = {
  id: string;
  name: string;
  category: 'acquisition' | 'retention' | 'revenue';
};

const AVAILABLE_METRICS: ReportMetric[] = [
  { id: 'signups', name: 'Total Signups', category: 'acquisition' },
  { id: 'dau', name: 'Daily Active Users', category: 'retention' },
  { id: 'revenue', name: 'Total Revenue', category: 'revenue' },
  // Add more metrics
];

export const CustomReportBuilder: React.FC = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<ReportMetric[]>([]);

  const addMetric = (metric: ReportMetric) => {
    if (!selectedMetrics.some(m => m.id === metric.id)) {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const removeMetric = (metricId: string) => {
    setSelectedMetrics(selectedMetrics.filter(m => m.id !== metricId));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white shadow-md rounded-lg p-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">Custom Report Builder</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Available Metrics</h3>
            <div className="space-y-2">
              {AVAILABLE_METRICS.map(metric => (
                <div
                  key={metric.id}
                  onClick={() => addMetric(metric)}
                  className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                >
                  {metric.name}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Selected Metrics</h3>
            {selectedMetrics.map(metric => (
              <div
                key={metric.id}
                className="p-2 bg-blue-100 rounded flex justify-between items-center mb-2"
              >
                {metric.name}
                <button
                  onClick={() => removeMetric(metric.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};