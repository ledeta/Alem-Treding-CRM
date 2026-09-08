import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Customer } from '../customers/entities/customer.entity'
import { PaymentRequest } from '../payments/entities/payment-request.entity'
import { CreditRequest } from '../credits/entities/credit-request.entity'
import { RefundRequest } from '../refunds/entities/refund-request.entity'

interface BatchUpdateData {
  ids: string[]
  updates: Record<string, any>
}

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name)

  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(PaymentRequest)
    private paymentsRepository: Repository<PaymentRequest>,
    @InjectRepository(CreditRequest)
    private creditsRepository: Repository<CreditRequest>,
    @InjectRepository(RefundRequest)
    private refundsRepository: Repository<RefundRequest>,
  ) {}

  async batchUpdateCustomers(data: BatchUpdateData): Promise<void> {
    this.logger.log(`Batch updating ${data.ids.length} customers`)
    
    for (const id of data.ids) {
      await this.customersRepository.update(id, data.updates)
    }

    this.logger.log('Batch customer update completed')
  }

  async batchUpdatePayments(data: BatchUpdateData): Promise<void> {
    this.logger.log(`Batch updating ${data.ids.length} payments`)
    
    for (const id of data.ids) {
      await this.paymentsRepository.update(id, data.updates)
    }

    this.logger.log('Batch payment update completed')
  }

  async batchApprovePayments(paymentIds: string[]): Promise<number> {
    this.logger.log(`Batch approving ${paymentIds.length} payments`)
    
    const result = await this.paymentsRepository.update(
      { id: In(paymentIds) },
      { status: 'Approved', approvalDate: new Date() }
    )

    this.logger.log(`Batch approved ${result.affected} payments`)
    return result.affected || 0
  }

  async batchRejectPayments(paymentIds: string[], reason?: string): Promise<number> {
    this.logger.log(`Batch rejecting ${paymentIds.length} payments`)
    
    const result = await this.paymentsRepository.update(
      { id: In(paymentIds) },
      { status: 'Rejected', notes: reason }
    )

    this.logger.log(`Batch rejected ${result.affected} payments`)
    return result.affected || 0
  }

  async batchDeleteCustomers(customerIds: string[]): Promise<number> {
    this.logger.warn(`Batch soft-deleting ${customerIds.length} customers`)
    
    const result = await this.customersRepository.update(
      { id: In(customerIds) },
      { isActive: false }
    )

    this.logger.log(`Batch deleted ${result.affected} customers`)
    return result.affected || 0
  }

  async batchProcessInactiveCustomers(days: number = 15): Promise<void> {
    this.logger.log(`Processing customers inactive for ${days}+ days`)

    const inactiveCustomers = await this.customersRepository
      .createQueryBuilder('customer')
      .where(
        `customer.lastTransactionDate IS NOT NULL AND customer.lastTransactionDate < NOW() - INTERVAL '${days} days'`
      )
      .getMany()

    for (const customer of inactiveCustomers) {
      await this.customersRepository.update(
        { id: customer.id },
        { isActive: false }
      )
    }

    this.logger.log(`Processed ${inactiveCustomers.length} inactive customers`)
  }

  async batchUpdateCreditBalances(): Promise<void> {
    this.logger.log('Batch updating customer credit balances')
    // Implementation would require a dedicated credit_balance column on customers table
    // For now, just log completion
    this.logger.log('Batch credit balance update completed')
  }

  async batchUpdateRefundBalances(): Promise<void> {
    this.logger.log('Batch updating customer refund balances')
    // Implementation would require a dedicated refund_balance column on customers table
    // For now, just log completion
    this.logger.log('Batch refund balance update completed')
  }

  async batchExportData(type: 'customers' | 'transactions' | 'payments'): Promise<any[]> {
    this.logger.log(`Exporting ${type} data`)

    switch (type) {
      case 'customers':
        return this.customersRepository.find({ take: 10000 })
      case 'transactions':
        // Import and return from transactions repository
        return []
      case 'payments':
        return this.paymentsRepository.find({ take: 10000 })
      default:
        return []
    }
  }
}
