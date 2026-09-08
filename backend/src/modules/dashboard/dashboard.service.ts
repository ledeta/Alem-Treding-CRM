import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { DashboardQueryDto, TimePeriod, KPIDto, ChartDataDto } from './dto/dashboard.dto';
import { Customer } from '../customers/entities/customer.entity';
import { CustomerBalance } from '../customers/entities/customer-balance.entity';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerBalance)
    private readonly balanceRepository: Repository<CustomerBalance>,
    private readonly customersService: CustomersService,
  ) {}

  /**
   * Get date range based on time period
   */
  private getDateRange(
    period: TimePeriod,
    startDate?: Date,
    endDate?: Date,
  ): { startDate: Date; endDate: Date } {
    const end = endDate || new Date();
    const start = new Date(end);

    switch (period) {
      case TimePeriod.TODAY:
        start.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.WEEK:
        start.setDate(start.getDate() - 7);
        break;
      case TimePeriod.MONTH:
        start.setMonth(start.getMonth() - 1);
        break;
      case TimePeriod.QUARTER:
        start.setMonth(start.getMonth() - 3);
        break;
      case TimePeriod.YEAR:
        start.setFullYear(start.getFullYear() - 1);
        break;
      case TimePeriod.CUSTOM:
        if (startDate) {
          return { startDate, endDate: end };
        }
        start.setMonth(start.getMonth() - 1);
        break;
    }

    return { startDate: start, endDate: end };
  }

  /**
   * Calculate KPIs
   */
  async calculateKPIs(queryDto: DashboardQueryDto): Promise<KPIDto> {
    const { period = TimePeriod.MONTH, startDate, endDate } = queryDto;
    const dateRange = this.getDateRange(period, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);

    try {
      // Total customers
      const totalCustomers = await this.customerRepository.count({
        where: { isActive: true },
      });

      // New customers in period
      const newCustomers = await this.customerRepository.count({
        where: {
          isActive: true,
          createdAt: Between(dateRange.startDate, dateRange.endDate),
        },
      });

      // Get all customers to check no-visit status
      const allCustomers = await this.customerRepository.find({
        relations: ['balance'],
      });

      // Calculate customers with no visits in 15+ days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 15);
      const noVisitCustomers = allCustomers.filter(
        (c) => !c.lastTransactionDate || c.lastTransactionDate < cutoffDate,
      ).length;

      // Get all balances for calculations
      const balances = await this.balanceRepository.find({
        relations: ['customer'],
      });

      // Total sales (from balances)
      const totalSales = balances.reduce((sum, b) => sum + Math.abs(b.balance), 0);

      // Total assets (inventory value)
      const totalAssets = balances.reduce((sum, b) => sum + b.balance, 0);

      // Net profit calculation
      const netProfit = totalSales - totalAssets;

      // Pending payments
      const pendingPayments = balances.reduce(
        (sum, b) => sum + Math.max(0, b.balance),
        0,
      );

      // Outstanding credits
      const outstandingCredits = balances.reduce(
        (sum, b) => sum + b.creditAmount,
        0,
      );

      // Pending refunds
      const pendingRefunds = balances.reduce(
        (sum, b) => sum + b.refundAmount,
        0,
      );

      // Average transaction value
      const averageTransactionValue =
        totalCustomers > 0 ? totalSales / totalCustomers : 0;

      // Retention rate (customers with transactions in period)
      const activeInPeriod = balances.filter(
        (b) =>
          b.customer.lastTransactionDate &&
          b.customer.lastTransactionDate >= dateRange.startDate,
      ).length;
      const retentionRate =
        totalCustomers > 0 ? (activeInPeriod / totalCustomers) * 100 : 0;

      // Payment success rate (placeholder - depends on payment system)
      const paymentSuccessRate = 85; // Default value

      // Total stock items (placeholder - would come from inventory module)
      const totalStockItems = allCustomers.length * 2; // Mock calculation

      return {
        totalCustomers,
        newCustomers,
        totalSales,
        totalAssets,
        netProfit,
        pendingPayments,
        outstandingCredits,
        pendingRefunds,
        averageTransactionValue,
        retentionRate,
        paymentSuccessRate,
        noVisitCustomers,
        totalStockItems,
      };
    } catch (error) {
      this.logger.error(`Failed to calculate KPIs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sales trend data
   */
  async getSalesTrend(queryDto: DashboardQueryDto): Promise<ChartDataDto[]> {
    const { period = TimePeriod.MONTH } = queryDto;

    // This would be populated from transactions if they exist
    // For now, return mock data structure
    const trendData: ChartDataDto[] = [];

    switch (period) {
      case TimePeriod.WEEK:
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach((day) => {
          trendData.push({
            label: day,
            value: Math.floor(Math.random() * 10000),
            percentage: 0,
          });
        });
        break;
      case TimePeriod.MONTH:
        for (let i = 1; i <= 4; i++) {
          trendData.push({
            label: `Week ${i}`,
            value: Math.floor(Math.random() * 50000),
            percentage: 0,
          });
        }
        break;
      case TimePeriod.YEAR:
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        months.forEach((month) => {
          trendData.push({
            label: month,
            value: Math.floor(Math.random() * 100000),
            percentage: 0,
          });
        });
        break;
    }

    // Calculate percentages
    const total = trendData.reduce((sum, d) => sum + d.value, 0);
    trendData.forEach((d) => {
      d.percentage = total > 0 ? (d.value / total) * 100 : 0;
    });

    return trendData;
  }

  /**
   * Get customer distribution
   */
  async getCustomerDistribution(): Promise<ChartDataDto[]> {
    const distribution: ChartDataDto[] = [
      { label: 'Active', value: 0, percentage: 0 },
      { label: 'Inactive', value: 0, percentage: 0 },
      { label: 'High Value', value: 0, percentage: 0 },
    ];

    const activeCount = await this.customerRepository.count({
      where: { isActive: true },
    });

    const inactiveCount = await this.customerRepository.count({
      where: { isActive: false },
    });

    // High value customers (placeholder logic)
    const highValueCount = Math.floor(activeCount * 0.2);

    distribution[0].value = activeCount;
    distribution[1].value = inactiveCount;
    distribution[2].value = highValueCount;

    const total = activeCount + inactiveCount;
    distribution.forEach((d) => {
      d.percentage = total > 0 ? (d.value / total) * 100 : 0;
    });

    return distribution;
  }

  /**
   * Get top items
   */
  async getTopItems(): Promise<ChartDataDto[]> {
    // This would be populated from transaction data
    // Mock implementation for structure
    const topItems: ChartDataDto[] = [
      { label: 'Item 1', value: 50000, percentage: 0 },
      { label: 'Item 2', value: 35000, percentage: 0 },
      { label: 'Item 3', value: 25000, percentage: 0 },
      { label: 'Item 4', value: 15000, percentage: 0 },
      { label: 'Item 5', value: 10000, percentage: 0 },
    ];

    const total = topItems.reduce((sum, d) => sum + d.value, 0);
    topItems.forEach((d) => {
      d.percentage = (d.value / total) * 100;
    });

    return topItems;
  }

  /**
   * Get top customers
   */
  async getTopCustomers(): Promise<ChartDataDto[]> {
    const customers = await this.customerRepository.find({
      relations: ['balance'],
      where: { isActive: true },
      order: { balance: { balance: 'DESC' } },
      take: 5,
    });

    const topCustomers = customers.map((c) => ({
      label: c.name,
      value: Math.abs(c.balance?.balance || 0),
      percentage: 0,
    }));

    const total = topCustomers.reduce((sum, d) => sum + d.value, 0);
    topCustomers.forEach((d) => {
      d.percentage = total > 0 ? (d.value / total) * 100 : 0;
    });

    return topCustomers;
  }

  /**
   * Get payment status breakdown
   */
  async getPaymentStatus(): Promise<ChartDataDto[]> {
    const balances = await this.balanceRepository.find({
      relations: ['customer'],
      where: { customer: { isActive: true } },
    });

    const status = {
      paid: 0,
      pending: 0,
      overdue: 0,
    };

    balances.forEach((b) => {
      if (b.balance <= 0) {
        status.paid++;
      } else {
        const daysSinceLast = b.customer.lastTransactionDate
          ? Math.floor(
              (new Date().getTime() -
                b.customer.lastTransactionDate.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 999;

        if (daysSinceLast > 30) {
          status.overdue++;
        } else {
          status.pending++;
        }
      }
    });

    const total = balances.length;
    return [
      { label: 'Paid', value: status.paid, percentage: (status.paid / total) * 100 },
      {
        label: 'Pending',
        value: status.pending,
        percentage: (status.pending / total) * 100,
      },
      {
        label: 'Overdue',
        value: status.overdue,
        percentage: (status.overdue / total) * 100,
      },
    ];
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<any[]> {
    const customers = await this.customerRepository.find({
      relations: ['balance'],
      where: { isActive: true, lastTransactionDate: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) },
      order: { lastTransactionDate: 'DESC' },
      take: limit,
    });

    return customers.map((c) => ({
      id: c.id,
      customerName: c.name,
      amount: Math.abs(c.balance?.balance || 0),
      type: c.balance?.balance > 0 ? 'credit' : 'payment',
      date: c.lastTransactionDate,
      status: 'completed',
    }));
  }

  /**
   * Get pending approvals count
   */
  async getPendingApprovalsCount(): Promise<{
    payments: number;
    credits: number;
    refunds: number;
  }> {
    // This would be populated from the approvals system
    // Placeholder implementation
    return {
      payments: 0,
      credits: 0,
      refunds: 0,
    };
  }

  /**
   * Get complete dashboard data
   */
  async getDashboardData(queryDto: DashboardQueryDto): Promise<any> {
    try {
      const [
        kpis,
        salesTrend,
        customerDistribution,
        topItems,
        topCustomers,
        paymentStatus,
        recentTransactions,
        pendingApprovals,
      ] = await Promise.all([
        this.calculateKPIs(queryDto),
        this.getSalesTrend(queryDto),
        this.getCustomerDistribution(),
        this.getTopItems(),
        this.getTopCustomers(),
        this.getPaymentStatus(),
        this.getRecentTransactions(),
        this.getPendingApprovalsCount(),
      ]);

      return {
        kpis,
        salesTrend,
        customerDistribution,
        topItems,
        topCustomers,
        paymentStatus,
        recentTransactions,
        pendingApprovals,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to generate dashboard data: ${error.message}`);
      throw error;
    }
  }
}
