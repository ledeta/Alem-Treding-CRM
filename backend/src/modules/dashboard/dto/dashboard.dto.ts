import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum TimePeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class DashboardQueryDto {
  @ApiProperty({ enum: TimePeriod, required: false, default: 'month' })
  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class KPIDto {
  @ApiProperty({ description: 'Total number of active customers' })
  totalCustomers: number;

  @ApiProperty({ description: 'Number of new customers in period' })
  newCustomers: number;

  @ApiProperty({ description: 'Total sales amount' })
  totalSales: number;

  @ApiProperty({ description: 'Total assets value' })
  totalAssets: number;

  @ApiProperty({ description: 'Net profit calculation' })
  netProfit: number;

  @ApiProperty({ description: 'Amount of pending payments' })
  pendingPayments: number;

  @ApiProperty({ description: 'Amount of outstanding credits' })
  outstandingCredits: number;

  @ApiProperty({ description: 'Amount of pending refunds' })
  pendingRefunds: number;

  @ApiProperty({ description: 'Average transaction value' })
  averageTransactionValue: number;

  @ApiProperty({ description: 'Customer retention rate' })
  retentionRate: number;

  @ApiProperty({ description: 'Payment success rate' })
  paymentSuccessRate: number;

  @ApiProperty({ description: 'Number of customers with no visits in 15+ days' })
  noVisitCustomers: number;

  @ApiProperty({ description: 'Total stock items count' })
  totalStockItems: number;
}

export class ChartDataDto {
  @ApiProperty({ description: 'Label for chart point' })
  label: string;

  @ApiProperty({ description: 'Value for chart point' })
  value: number;

  @ApiProperty({ description: 'Percentage of total' })
  percentage: number;
}

export class DashboardDataDto {
  @ApiProperty({ description: 'Key performance indicators' })
  kpis: KPIDto;

  @ApiProperty({
    description: 'Sales trend data for time period',
    type: [ChartDataDto],
  })
  salesTrend: ChartDataDto[];

  @ApiProperty({
    description: 'Customer distribution data',
    type: [ChartDataDto],
  })
  customerDistribution: ChartDataDto[];

  @ApiProperty({
    description: 'Top performing items',
    type: [ChartDataDto],
  })
  topItems: ChartDataDto[];

  @ApiProperty({
    description: 'Top customers by sales',
    type: [ChartDataDto],
  })
  topCustomers: ChartDataDto[];

  @ApiProperty({
    description: 'Payment status breakdown',
    type: [ChartDataDto],
  })
  paymentStatus: ChartDataDto[];

  @ApiProperty({
    description: 'Recent transactions',
    isArray: true,
  })
  recentTransactions: any[];

  @ApiProperty({
    description: 'Pending approvals count',
  })
  pendingApprovals: {
    payments: number;
    credits: number;
    refunds: number;
  };

  @ApiProperty({ description: 'Data collection timestamp' })
  generatedAt: Date;
}

export class ComparisonDto {
  @ApiProperty({ description: 'Previous period value' })
  previous: number;

  @ApiProperty({ description: 'Current period value' })
  current: number;

  @ApiProperty({ description: 'Change percentage' })
  changePercent: number;

  @ApiProperty({ description: 'Trend direction' })
  trend: 'up' | 'down' | 'stable';
}

export class DashboardComparisonDto extends DashboardDataDto {
  @ApiProperty({ description: 'KPI comparisons with previous period' })
  kpiComparison: Record<string, ComparisonDto>;
}
