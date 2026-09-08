import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../../common/guards/auth.guard'
import { RoleGuardClass } from '../../common/guards/role.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('analytics')
@UseGuards(JwtAuthGuard, RoleGuardClass)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('kpis')
  @Roles('admin')
  async getKPIs(): Promise<any> {
    const kpis = await this.analyticsService.getDashboardKPIs()
    return { success: true, data: kpis }
  }

  @Get('sales-trend')
  @Roles('admin')
  async getSalesTrend(@Query('days') days: number = 30): Promise<any> {
    const data = await this.analyticsService.getSalesTrend(days)
    return { success: true, data }
  }

  @Get('top-customers')
  @Roles('admin')
  async getTopCustomers(@Query('limit') limit: number = 10): Promise<any> {
    const data = await this.analyticsService.getTopCustomers(limit)
    return { success: true, data }
  }

  @Get('top-items')
  @Roles('admin')
  async getTopItems(@Query('limit') limit: number = 10): Promise<any> {
    const data = await this.analyticsService.getTopItems(limit)
    return { success: true, data }
  }

  @Get('recent-activities')
  @Roles('admin')
  async getRecentActivities(@Query('limit') limit: number = 10): Promise<any> {
    const data = await this.analyticsService.getRecentActivities(limit)
    return { success: true, data }
  }

  @Get('monthly-revenue')
  @Roles('admin')
  async getMonthlyRevenue(): Promise<any> {
    const data = await this.analyticsService.getMonthlyRevenue()
    return { success: true, data }
  }

  @Get('customer-metrics')
  @Roles('admin')
  async getCustomerMetrics() {
    const data = await this.analyticsService.getCustomerMetrics()
    return { success: true, data }
  }
}
