import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RoleGuardClass } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReportService } from './report.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RoleGuardClass)
@Roles('admin')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('sales')
  async generateSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() response: Response,
  ) {
    const buffer = await this.reportService.generateSalesReport(
      new Date(startDate),
      new Date(endDate),
    );
    response.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=sales-report.xlsx',
    });
    response.send(buffer);
  }

  @Get('payments')
  async generatePaymentReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() response: Response,
  ) {
    const buffer = await this.reportService.generatePaymentReport(
      new Date(startDate),
      new Date(endDate),
    );
    response.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=payment-report.xlsx',
    });
    response.send(buffer);
  }

  @Get('customers')
  async generateCustomerReport(@Res() response: Response) {
    const buffer = await this.reportService.generateCustomerReport();
    response.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=customer-report.xlsx',
    });
    response.send(buffer);
  }

  @Get('financial')
  async generateFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() response: Response,
  ) {
    const buffer = await this.reportService.generateFinancialReport(
      new Date(startDate),
      new Date(endDate),
    );
    response.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=financial-report.xlsx',
    });
    response.send(buffer);
  }
}
