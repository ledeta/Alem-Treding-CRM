'use client'

import {
  BarChart,
  Bar,
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

interface BarChartWrapperProps {
  title?: string
  data: ChartData[]
  dataKey: string
  fill?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

export function BarChartWrapper({
  title,
  data,
  dataKey,
  fill = '#2563EB',
  height = 300,
  showGrid = true,
  showLegend = true,
}: BarChartWrapperProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
            <Bar dataKey={dataKey} fill={fill} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
