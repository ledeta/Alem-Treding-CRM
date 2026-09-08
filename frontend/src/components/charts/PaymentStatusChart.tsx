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

interface PaymentStatusChartProps {
  data: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  loading?: boolean;
}

const STATUS_COLORS: { [key: string]: string } = {
  'Pending': '#daa520',
  'Approved': '#2d5a3d',
  'Rejected': '#8b4545',
  'Completed': '#1a2332',
};

export default function PaymentStatusChart({ data, loading }: PaymentStatusChartProps) {
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
        <p className="text-gray-500">No payment data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="status" stroke="#666" />
        <YAxis stroke="#666" yAxisId="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
        <YAxis stroke="#666" yAxisId="right" orientation="right" label={{ value: 'Amount (ብር)', angle: 90, position: 'insideRight' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
          }}
          formatter={(value: any) => {
            if (typeof value === 'number' && value > 100) return `ብር ${value.toLocaleString()}`;
            return value;
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="count" name="Count" fill="#b8860b" radius={[8, 8, 0, 0]} />
        <Bar yAxisId="right" dataKey="amount" name="Amount" fill="#1a2332" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
