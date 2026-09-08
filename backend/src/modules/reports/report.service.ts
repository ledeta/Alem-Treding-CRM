import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as XLSX from 'exceljs';
import { SalesTransaction } from '../transactions/entities/sales-transaction.entity';
import { PaymentRequest } from '../payments/entities/payment-request.entity';
import { CreditRequest } from '../credits/entities/credit-request.entity';
import { RefundRequest } from '../refunds/entities/refund-request.entity';
import { Customer } from '../customers/entities/customer.entity';

@Injectable()
export class ReportService {
  private logger = new Logger('ReportService');

  constructor(
    @InjectRepository(SalesTransaction)
    private transactionRepository: Repository<SalesTransaction>,
    @InjectRepository(PaymentRequest)
    private paymentRepository: Repository<PaymentRequest>,
    @InjectRepository(CreditRequest)
    private creditRepository: Repository<CreditRequest>,
    @InjectRepository(RefundRequest)
    private refundRepository: Repository<RefundRequest>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async generateSalesReport(startDate: Date, endDate: Date): Promise<Buffer> {
    const transactions = await this.transactionRepository.find({
      where: {
        transactionDate: Between(startDate, endDate),
      },
      relations: ['customer', 'item'],
      order: { transactionDate: 'DESC' },
    });

    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
      { header: 'Transaction ID', key: 'id', width: 20 },
      { header: 'Customer', key: 'customerName', width: 25 },
      { header: 'Item', key: 'itemName', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit Price', key: 'unitPrice', width: 12 },
      { header: 'Total Price', key: 'totalPrice', width: 12 },
      { header: 'Date', key: 'date', width: 15 },
    ];

    transactions.forEach((tx) => {
      worksheet.addRow({
        id: tx.id,
        customerName: tx.customer?.name || 'N/A',
        itemName: tx.item?.name || 'N/A',
        quantity: tx.quantity,
        unitPrice: tx.unitPrice,
        totalPrice: tx.totalAmount,
        date: tx.transactionDate.toLocaleDateString(),
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async generatePaymentReport(startDate: Date, endDate: Date): Promise<any> {
    const payments = await this.paymentRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });

    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet('Payment Report');

    worksheet.columns = [
      { header: 'Payment ID', key: 'id', width: 20 },
      { header: 'Customer', key: 'customerName', width: 25 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Bank', key: 'bank', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date', key: 'date', width: 15 },
    ];

    payments.forEach((payment) => {
      worksheet.addRow({
        id: payment.id,
        customerName: payment.customer?.name || 'N/A',
        amount: payment.amount,
        bank: payment.bank,
        status: payment.status,
        date: payment.createdAt.toLocaleDateString(),
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async generateCustomerReport(): Promise<any> {
    const customers = await this.customerRepository.find({
      relations: ['balances'],
      order: { createdAt: 'DESC' },
    });

    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet('Customer Report');

    worksheet.columns = [
      { header: 'Customer ID', key: 'id', width: 20 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Total Purchases', key: 'totalPurchases', width: 15 },
      { header: 'Balance', key: 'balance', width: 12 },
      { header: 'Last Visit', key: 'lastVisit', width: 15 },
    ];

    customers.forEach((customer) => {
      const balance = customer.balance?.balance || 0;
      worksheet.addRow({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        totalPurchases: 0, // Would need transaction data to calculate
        balance,
        lastVisit: customer.lastTransactionDate?.toLocaleDateString() || 'N/A',
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async generateFinancialReport(startDate: Date, endDate: Date): Promise<any> {
    const [transactions, payments, credits, refunds] = await Promise.all([
      this.transactionRepository.find({
        where: { transactionDate: Between(startDate, endDate) },
      }),
      this.paymentRepository.find({
        where: { createdAt: Between(startDate, endDate), status: 'approved' },
      }),
      this.creditRepository.find({
        where: { createdAt: Between(startDate, endDate), status: 'approved' },
      }),
      this.refundRepository.find({
        where: { createdAt: Between(startDate, endDate), status: 'approved' },
      }),
    ]);

    const totalSales = transactions.reduce((sum, t) => sum + parseFloat(String(t.totalAmount)), 0);
    const totalPayments = payments.reduce((sum, p) => sum + parseFloat(String(p.amount)), 0);
    const totalCredits = credits.reduce((sum, c) => sum + parseFloat(String(c.approvedAmount)), 0);
    const totalRefunds = refunds.reduce((sum, r) => sum + parseFloat(String(r.refundAmount)), 0);
    const netProfit = totalSales - totalRefunds;

    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet('Financial Summary');

    worksheet.addRow(['Financial Report', startDate.toLocaleDateString(), 'to', endDate.toLocaleDateString()]);
    worksheet.addRow([]);
    worksheet.addRow(['Total Sales', totalSales]);
    worksheet.addRow(['Total Payments Received', totalPayments]);
    worksheet.addRow(['Total Credits Given', totalCredits]);
    worksheet.addRow(['Total Refunds Issued', totalRefunds]);
    worksheet.addRow(['Net Profit', netProfit]);

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
}
