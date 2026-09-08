'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TopItemsChartProps {
  data: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  loading?: boolean;
}

const COLORS = ['#b8860b', '#d4af37', '#1a2332', '#8b6914', '#c4a747', '#daa520', '#2d5a3d', '#4a6fa5', '#8b4545', '#c4a747'];

export default function TopItemsChart({ data, loading }: TopItemsChartProps) {
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
        <p className="text-gray-500">No items data available</p>
      </div>
    );
  }

  const chartData = data.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis type="number" stroke="#666" />
        <YAxis dataKey="name" type="category" width={100} stroke="#666" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
          }}
          formatter={(value: number) => value.toLocaleString()}
        />
        <Legend />
        <Bar dataKey="sales" name="Units Sold" fill="#b8860b" radius={[0, 8, 8, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
