import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../common/guards/role.guard';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get complete dashboard data' })
  async getDashboard(@Query() queryDto: DashboardQueryDto) {
    this.logger.log(`Fetching dashboard data - period: ${queryDto.period}`);
    return this.dashboardService.getDashboardData(queryDto);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get key performance indicators' })
  async getKPIs(@Query() queryDto: DashboardQueryDto) {
    this.logger.log(`Fetching KPIs - period: ${queryDto.period}`);
    return this.dashboardService.calculateKPIs(queryDto);
  }

  @Get('sales-trend')
  @ApiOperation({ summary: 'Get sales trend data' })
  async getSalesTrend(@Query() queryDto: DashboardQueryDto) {
    this.logger.log(`Fetching sales trend - period: ${queryDto.period}`);
    return this.dashboardService.getSalesTrend(queryDto);
  }

  @Get('customer-distribution')
  @ApiOperation({ summary: 'Get customer distribution data' })
  async getCustomerDistribution() {
    this.logger.log(`Fetching customer distribution`);
    return this.dashboardService.getCustomerDistribution();
  }

  @Get('top-items')
  @ApiOperation({ summary: 'Get top performing items' })
  async getTopItems() {
    this.logger.log(`Fetching top items`);
    return this.dashboardService.getTopItems();
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Get top customers by sales' })
  async getTopCustomers() {
    this.logger.log(`Fetching top customers`);
    return this.dashboardService.getTopCustomers();
  }

  @Get('payment-status')
  @ApiOperation({ summary: 'Get payment status breakdown' })
  async getPaymentStatus() {
    this.logger.log(`Fetching payment status`);
    return this.dashboardService.getPaymentStatus();
  }

  @Get('recent-transactions')
  @ApiOperation({ summary: 'Get recent transactions' })
  async getRecentTransactions(@Query('limit') limit: number = 10) {
    this.logger.log(`Fetching recent transactions - limit: ${limit}`);
    return this.dashboardService.getRecentTransactions(limit);
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get pending approvals count' })
  async getPendingApprovals() {
    this.logger.log(`Fetching pending approvals`);
    return this.dashboardService.getPendingApprovalsCount();
  }
}
