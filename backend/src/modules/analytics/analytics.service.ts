import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Customer } from '../customers/entities/customer.entity'
import { SalesTransaction } from '../transactions/entities/sales-transaction.entity'
import { PaymentRequest } from '../payments/entities/payment-request.entity'
import { Item } from '../items/entities/item.entity'

interface DashboardKPIs {
  totalCustomers: number
  totalSales: number
  totalPendingPayments: number
  totalStockItems: number
  netProfit: number
  totalCredit: number
  totalRefund: number
  pendingApprovals: number
}

interface SalesTrend {
  date: string
  sales: number
  transactions: number
}

interface TopCustomer {
  id: string
  name: string
  totalPurchases: number
}

interface TopItem {
  id: string
  name: string
  unitsSold: number
  revenue: number
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(SalesTransaction)
    private transactionsRepository: Repository<SalesTransaction>,
    @InjectRepository(PaymentRequest)
    private paymentsRepository: Repository<PaymentRequest>,
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const totalCustomers = await this.customersRepository.count()

    const totalSalesResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.totalAmount)', 'total')
      .getRawOne()

    const pendingPayments = await this.paymentsRepository.count({
      where: { status: 'pending' },
    })

    const totalItems = await this.itemsRepository.count()

    // Calculate profit
    const profitResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.item', 'item')
      .select('SUM((transaction.totalAmount - (item.purchasePrice * transaction.quantity)))', 'profit')
      .getRawOne()

    const netProfit = parseFloat(profitResult.profit || '0')

    return {
      totalCustomers,
      totalSales: parseFloat(totalSalesResult.total || '0'),
      totalPendingPayments: pendingPayments,
      totalStockItems: totalItems,
      netProfit,
      totalCredit: 0, // Implement from credits module
      totalRefund: 0, // Implement from refunds module
      pendingApprovals: pendingPayments,
    }
  }

  async getSalesTrend(days: number = 30): Promise<SalesTrend[]> {
    const result = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select("DATE(transaction.transactionDate)", 'date')
      .addSelect('SUM(transaction.totalAmount)', 'sales')
      .addSelect('COUNT(*)', 'transactions')
      .where(
        `transaction.transactionDate >= NOW() - INTERVAL '${days} days'`
      )
      .groupBy("DATE(transaction.transactionDate)")
      .orderBy("DATE(transaction.transactionDate)", 'ASC')
      .getRawMany()

    return result.map((r) => ({
      date: r.date,
      sales: parseFloat(r.sales || '0'),
      transactions: parseInt(r.transactions || '0'),
    }))
  }

  async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
    const result = await this.customersRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect(
        'sales_transaction',
        'transaction',
        'customer.id = transaction.customerId'
      )
      .select('customer.id', 'id')
      .addSelect('customer.name', 'name')
      .addSelect('SUM(transaction.totalAmount)', 'totalPurchases')
      .groupBy('customer.id')
      .orderBy('totalPurchases', 'DESC')
      .limit(limit)
      .getRawMany()

    return result.map((r) => ({
      id: r.id,
      name: r.name,
      totalPurchases: parseFloat(r.totalPurchases || '0'),
    }))
  }

  async getTopItems(limit: number = 10): Promise<TopItem[]> {
    const result = await this.itemsRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect(
        'sales_transaction',
        'transaction',
        'item.id = transaction.itemId'
      )
      .select('item.id', 'id')
      .addSelect('item.name', 'name')
      .addSelect('SUM(transaction.quantity)', 'unitsSold')
      .addSelect('SUM(transaction.totalAmount)', 'revenue')
      .groupBy('item.id')
      .orderBy('unitsSold', 'DESC')
      .limit(limit)
      .getRawMany()

    return result.map((r) => ({
      id: r.id,
      name: r.name,
      unitsSold: parseInt(r.unitsSold || '0'),
      revenue: parseFloat(r.revenue || '0'),
    }))
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    const transactions = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.customer', 'customer')
      .orderBy('transaction.transactionDate', 'DESC')
      .take(limit)
      .getMany()

    return transactions.map((t) => ({
      type: 'sale',
      description: `${t.customer?.name || 'Unknown'} made a purchase`,
      amount: t.totalAmount,
      timestamp: t.transactionDate,
    }))
  }

  async getMonthlyRevenue(): Promise<any[]> {
    const result = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select("DATE_TRUNC('month', transaction.transactionDate)", 'month')
      .addSelect('SUM(transaction.totalAmount)', 'revenue')
      .groupBy("DATE_TRUNC('month', transaction.transactionDate)")
      .orderBy("DATE_TRUNC('month', transaction.transactionDate)", 'DESC')
      .limit(12)
      .getRawMany()

    return result.map((r) => ({
      month: new Date(r.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: parseFloat(r.revenue || '0'),
    }))
  }

  async getCustomerMetrics() {
    const activeCustomers = await this.customersRepository
      .createQueryBuilder('customer')
      .leftJoin('sales_transaction', 'transaction', 'customer.id = transaction.customerId')
      .where('transaction.transactionDate >= NOW() - INTERVAL \'30 days\'')
      .select('COUNT(DISTINCT customer.id)', 'count')
      .getRawOne()

    const newCustomers = await this.customersRepository
      .createQueryBuilder('customer')
      .where('customer.createdAt >= NOW() - INTERVAL \'30 days\'')
      .select('COUNT(*)', 'count')
      .getRawOne()

    return {
      activeCustomers30Days: parseInt(activeCustomers.count || '0'),
      newCustomersThisMonth: parseInt(newCustomers.count || '0'),
    }
  }
}
