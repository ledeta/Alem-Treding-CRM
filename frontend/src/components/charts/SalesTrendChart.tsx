'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface SalesTrendChartProps {
  data: Array<{
    date: string;
    sales: number;
    target?: number;
  }>;
  loading?: boolean;
}

export default function SalesTrendChart({ data, loading }: SalesTrendChartProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <p className="text-gray-500">No sales data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#b8860b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1a2332" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#1a2332" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="date" stroke="#666" />
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
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#b8860b"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorSales)"
          name="Sales"
        />
        {data.some((item) => item.target) && (
          <Area
            type="monotone"
            dataKey="target"
            stroke="#1a2332"
            strokeWidth={2}
            fillOpacity={0.6}
            fill="url(#colorTarget)"
            name="Target"
            strokeDasharray="5 5"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
