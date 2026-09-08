'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface ChartData {
  name: string
  [key: string]: string | number
}

interface LineChartWrapperProps {
  title?: string
  data: ChartData[]
  dataKey: string
  stroke?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

export function LineChartWrapper({
  title,
  data,
  dataKey,
  stroke = '#2563EB',
  height = 300,
  showGrid = true,
  showLegend = true,
}: LineChartWrapperProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              dot={{ fill: stroke, r: 4 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
