import React from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis} from 'recharts';

interface ABTestingResult {
  variationName: string;
  conversionRate: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  significanceLevel: number;
}

interface ABTestingWidgetProps {
  data: ABTestingResult[];
}

export const ABTestingWidget: React.FC<ABTestingWidgetProps> = ({ data }) => {
  const winningVariation = data.reduce((max, variation) =>
    variation.conversionRate > max.conversionRate ? variation : max,
    data[0]
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">A/B Testing Results</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="variationName" />
          <YAxis label={{ value: 'Conversion Rate', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value, name, props) => [
              `${(value as number).toFixed(2)}%`,
              'Conversion Rate'
            ]}
          />
          <Bar dataKey="conversionRate" fill="#3182ce" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <h3 className="font-medium">Winning Variation</h3>
        <p className="text-sm text-gray-600">
          {winningVariation.variationName}
          {` (${winningVariation.conversionRate.toFixed(2)}%)`}
        </p>
        <p className="text-xs text-gray-500">
          Significance Level: {winningVariation.significanceLevel.toFixed(2)}
        </p>
      </div>
    </div>
  );
};