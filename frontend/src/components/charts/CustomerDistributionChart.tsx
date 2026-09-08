'use client';

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CustomerDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  loading?: boolean;
}

const COLORS = ['#b8860b', '#d4af37', '#1a2332', '#8b6914', '#c4a747', '#daa520'];

export default function CustomerDistributionChart({
  data,
  loading,
}: CustomerDistributionChartProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gold-500 rounded-full" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <p className="text-gray-500">No distribution data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-sm">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} ({payload[0].percent?.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) =>
            `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
          }
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
