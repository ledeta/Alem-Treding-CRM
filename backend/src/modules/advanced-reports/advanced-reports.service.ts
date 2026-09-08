import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { SalesTransaction } from '../transactions/entities/sales-transaction.entity';
import { Customer } from '../customers/entities/customer.entity';
import { PaymentRequest } from '../payments/entities/payment-request.entity';
import { Item } from '../items/entities/item.entity';

@Injectable()
export class AdvancedReportsService {
  private readonly logger = new Logger(AdvancedReportsService.name);

  constructor(
    @InjectRepository(SalesTransaction)
    private transactionRepo: Repository<SalesTransaction>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(PaymentRequest)
    private paymentRepo: Repository<PaymentRequest>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>
  ) {}

  async generateSalesReport(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
    const transactions = await this.transactionRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['customer'],
    }) as SalesTransaction[];

    const grouped = this.groupByPeriod(transactions, groupBy);

    const report = Object.entries(grouped).map(([period, items]: [string, any[]]) => {
      const totalAmount = items.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
      const count = items.length;
      const avgAmount = totalAmount / count;

      return {
        period,
        totalSales: totalAmount,
        transactionCount: count,
        averageTransaction: avgAmount,
        transactions: items,
      };
    });

    return {
      startDate,
      endDate,
      totalRevenue: transactions.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0),
      totalTransactions: transactions.length,
      data: report,
    };
  }

  async generateCustomerReport(startDate: Date, endDate: Date) {
    const customers = await this.customerRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const customerMetrics = await Promise.all(
      customers.map(async (customer) => {
        const transactions = await this.transactionRepo.find({
          where: {
            customer: { id: customer.id },
            createdAt: Between(startDate, endDate),
          },
        });

        const totalSpend = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

        return {
          customerId: customer.id,
          customerName: customer.name,
          email: customer.email,
          phone: customer.phone,
          city: customer.city,
          transactionCount: transactions.length,
          totalSpend,
          averageTransaction: transactions.length > 0 ? totalSpend / transactions.length : 0,
          balance: customer.balance?.balance || 0,
          status: customer.isActive ? 'Active' : 'Inactive',
        };
      })
    );

    // Sort by total spend
    customerMetrics.sort((a, b) => b.totalSpend - a.totalSpend);

    return {
      startDate,
      endDate,
      newCustomers: customers.length,
      totalSpend: customerMetrics.reduce((sum, c) => sum + c.totalSpend, 0),
      averageCustomerValue: customerMetrics.length > 0
        ? customerMetrics.reduce((sum, c) => sum + c.totalSpend, 0) / customerMetrics.length
        : 0,
      customers: customerMetrics,
    };
  }

  async generatePaymentReport(startDate: Date, endDate: Date) {
    const payments = await this.paymentRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['customer'],
    });

    const byStatus = {
      approved: payments.filter((p) => p.status === 'approved'),
      rejected: payments.filter((p) => p.status === 'rejected'),
      pending: payments.filter((p) => p.status === 'pending'),
    };

    return {
      startDate,
      endDate,
      totalPaymentRequests: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + ((p.amount as any) || 0), 0),
      approved: {
        count: byStatus.approved.length,
        amount: byStatus.approved.reduce((sum, p) => sum + ((p.amount as any) || 0), 0),
      },
      rejected: {
        count: byStatus.rejected.length,
        amount: byStatus.rejected.reduce((sum, p) => sum + ((p.amount as any) || 0), 0),
      },
      pending: {
        count: byStatus.pending.length,
        amount: byStatus.pending.reduce((sum, p) => sum + ((p.amount as any) || 0), 0),
      },
      approvalRate: payments.length > 0
        ? ((byStatus.approved.length / payments.length) * 100).toFixed(2)
        : 0,
      payments: payments.map((p) => ({
        id: p.id,
        customer: p.customer?.name,
        amount: p.amount,
        status: p.status,
        date: p.createdAt,
      })),
    };
  }

  async generateInventoryReport() {
    const items = await this.itemRepo.find({
      relations: ['stock'],
    });

    const lowStock = items.filter((item) => 
      item.stock && (item.stock.quantity || 0) < (item.stock.lowStockThreshold || 10)
    );

    const totalValue = items.reduce((sum, item) => 
      sum + ((item.sellingPrice || 0) * (item.stock?.quantity || 0)), 0
    );

    return {
      totalItems: items.length,
      totalValue,
      averageStockLevel: items.length > 0
        ? items.reduce((sum, item) => sum + (item.stock?.quantity || 0), 0) / items.length
        : 0,
      lowStockItems: lowStock,
      lowStockCount: lowStock.length,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.stock?.quantity || 0,
        minimumStock: item.stock?.lowStockThreshold || 10,
        price: item.sellingPrice,
        totalValue: (item.sellingPrice || 0) * (item.stock?.quantity || 0),
        status: (item.stock?.quantity || 0) < (item.stock?.lowStockThreshold || 10) ? 'Low Stock' : 'OK',
      })),
    };
  }

  async generateFinancialReport(startDate: Date, endDate: Date) {
    const transactions = await this.transactionRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const payments = await this.paymentRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalPayments = payments
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const netProfit = totalRevenue - totalPayments;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    return {
      startDate,
      endDate,
      revenue: totalRevenue,
      expenses: totalPayments,
      netProfit,
      profitMargin,
      transactions: transactions.length,
      transactionValue: transactions.length > 0 ? (totalRevenue / transactions.length).toFixed(2) : 0,
      outstandingPayments: payments
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    };
  }

  private groupByPeriod(data: any[], groupBy: 'day' | 'week' | 'month') {
    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = date.toLocaleDateString();
      } else if (groupBy === 'week') {
        const weekNumber = this.getWeekNumber(date);
        key = `Week ${weekNumber} ${date.getFullYear()}`;
      } else if (groupBy === 'month') {
        key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  }

  private getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  }
}
