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

interface RevenueBarChartProps {
  data: Array<{
    name: string;
    value: number;
    category?: string;
  }>;
  loading?: boolean;
  title?: string;
}

const COLORS = ['#b8860b', '#d4af37', '#1a2332', '#8b6914', '#c4a747'];

export default function RevenueBarChart({ data, loading, title }: RevenueBarChartProps) {
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
        <p className="text-gray-500">No revenue data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
        <YAxis stroke="#666" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
          }}
          formatter={(value: number) => `ብር ${value.toLocaleString()}`}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="value" name={title || 'Revenue'} radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
