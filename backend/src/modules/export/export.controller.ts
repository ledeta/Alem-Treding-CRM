import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleGuard } from '../../common/guards/role.guard';

@Controller('export')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ExportController {
  private readonly logger = new Logger('ExportController');

  constructor(private readonly exportService: ExportService) {}

  @Post('transactions-excel')
  @Roles('admin')
  async exportTransactionsToExcel(
    @Body() { transactions }: { transactions: any[] },
    @Res() res: Response
  ) {
    try {
      const buffer = await this.exportService.exportTransactionsToExcel(transactions);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="transactions-${new Date().getTime()}.xlsx"`
      );
      res.send(buffer);

      this.logger.log('Transactions exported to Excel');
    } catch (error) {
      this.logger.error('Error exporting transactions', error);
      throw new BadRequestException('Failed to export transactions');
    }
  }

  @Post('customers-excel')
  @Roles('admin')
  async exportCustomersToExcel(
    @Body() { customers }: { customers: any[] },
    @Res() res: Response
  ) {
    try {
      const buffer = await this.exportService.exportCustomersToExcel(customers);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="customers-${new Date().getTime()}.xlsx"`
      );
      res.send(buffer);

      this.logger.log('Customers exported to Excel');
    } catch (error) {
      this.logger.error('Error exporting customers', error);
      throw new BadRequestException('Failed to export customers');
    }
  }

  @Post('payments-excel')
  @Roles('admin')
  async exportPaymentsToExcel(
    @Body() { payments }: { payments: any[] },
    @Res() res: Response
  ) {
    try {
      const buffer = await this.exportService.exportPaymentsToExcel(payments);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="payments-${new Date().getTime()}.xlsx"`
      );
      res.send(buffer);

      this.logger.log('Payments exported to Excel');
    } catch (error) {
      this.logger.error('Error exporting payments', error);
      throw new BadRequestException('Failed to export payments');
    }
  }

  @Post('dashboard-pdf')
  @Roles('admin')
  async exportDashboardToPDF(
    @Body() { kpis, charts }: { kpis: any; charts: any },
    @Res() res: Response
  ) {
    try {
      const buffer = await this.exportService.exportDashboardToPDF(kpis, charts);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="dashboard-${new Date().getTime()}.pdf"`
      );
      res.send(buffer);

      this.logger.log('Dashboard exported to PDF');
    } catch (error) {
      this.logger.error('Error exporting dashboard', error);
      throw new BadRequestException('Failed to export dashboard');
    }
  }
}
