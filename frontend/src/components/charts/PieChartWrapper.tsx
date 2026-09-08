'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface ChartData {
  name: string
  value: number
}

interface PieChartWrapperProps {
  title?: string
  data: ChartData[]
  colors?: string[]
  height?: number
  showLegend?: boolean
}

const DEFAULT_COLORS = [
  '#2563EB',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
]

export function PieChartWrapper({
  title,
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  showLegend = true,
}: PieChartWrapperProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
