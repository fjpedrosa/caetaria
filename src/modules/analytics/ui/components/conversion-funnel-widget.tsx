import React from 'react';
import {
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip} from 'recharts';

interface ConversionFunnelWidgetProps {
  data: Array<{
    name: string;
    value: number;
    dropoffRate: number;
  }>;
}

export const ConversionFunnelWidget: React.FC<ConversionFunnelWidgetProps> = ({ data }) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
      <ResponsiveContainer width="100%" height={300}>
        <FunnelChart>
          <Funnel
            data={data}
            dataKey="value"
            labelKey="name"
            fill="#3182ce"
            stroke="#2c5282"
          >
            <LabelList
              position="right"
              fill="#333"
              formatter={(value, entry) => {
                const { payload } = entry;
                return `${payload.name}: ${value} (${payload.dropoffRate.toFixed(2)}% drop)`;
              }}
            />
          </Funnel>
          <Tooltip
            formatter={(value, name, props) => [
              value,
              `${props.payload.name} Conversion`
            ]}
          />
        </FunnelChart>
      </ResponsiveContainer>
      <div className="text-sm text-gray-600 mt-2">
        Total Conversion Value: {totalValue}
      </div>
    </div>
  );
};