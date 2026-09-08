import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AdvancedReportsService } from './advanced-reports.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleGuard } from '../../common/guards/role.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AdvancedReportsController {
  private readonly logger = new Logger('AdvancedReportsController');

  constructor(private readonly reportsService: AdvancedReportsService) {}

  @Get('sales')
  @Roles('admin')
  async generateSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day'
  ) {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException('startDate and endDate are required');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        throw new BadRequestException('startDate must be before endDate');
      }

      const report = await this.reportsService.generateSalesReport(start, end, groupBy);

      this.logger.log(`Sales report generated from ${startDate} to ${endDate}`);

      return {
        success: true,
        report,
      };
    } catch (error) {
      this.logger.error(`Sales report generation failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to generate sales report');
    }
  }

  @Get('customers')
  @Roles('admin')
  async generateCustomerReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException('startDate and endDate are required');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        throw new BadRequestException('startDate must be before endDate');
      }

      const report = await this.reportsService.generateCustomerReport(start, end);

      this.logger.log(`Customer report generated from ${startDate} to ${endDate}`);

      return {
        success: true,
        report,
      };
    } catch (error) {
      this.logger.error(`Customer report generation failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to generate customer report');
    }
  }

  @Get('payments')
  @Roles('admin')
  async generatePaymentReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException('startDate and endDate are required');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        throw new BadRequestException('startDate must be before endDate');
      }

      const report = await this.reportsService.generatePaymentReport(start, end);

      this.logger.log(`Payment report generated from ${startDate} to ${endDate}`);

      return {
        success: true,
        report,
      };
    } catch (error) {
      this.logger.error(`Payment report generation failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to generate payment report');
    }
  }

  @Get('inventory')
  @Roles('admin')
  async generateInventoryReport() {
    try {
      const report = await this.reportsService.generateInventoryReport();

      this.logger.log('Inventory report generated');

      return {
        success: true,
        report,
      };
    } catch (error) {
      this.logger.error(`Inventory report generation failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to generate inventory report');
    }
  }

  @Get('financial')
  @Roles('admin')
  async generateFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException('startDate and endDate are required');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        throw new BadRequestException('startDate must be before endDate');
      }

      const report = await this.reportsService.generateFinancialReport(start, end);

      this.logger.log(`Financial report generated from ${startDate} to ${endDate}`);

      return {
        success: true,
        report,
      };
    } catch (error) {
      this.logger.error(`Financial report generation failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to generate financial report');
    }
  }
}
