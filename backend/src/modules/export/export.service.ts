import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class ExportService {
  async exportTransactionsToExcel(transactions: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
      { header: 'Transaction ID', key: 'transactionId', width: 18 },
      { header: 'Customer', key: 'customerName', width: 20 },
      { header: 'Item', key: 'itemName', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit Price', key: 'unitPrice', width: 12 },
      { header: 'Total Amount', key: 'totalAmount', width: 14 },
      { header: 'Type', key: 'transactionType', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date', key: 'transactionDate', width: 18 },
    ];

    // Set default font for header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB8860B' },
    };

    transactions.forEach((transaction) => {
      worksheet.addRow({
        transactionId: transaction.transactionId || '',
        customerName: transaction.customer?.name || '',
        itemName: transaction.item?.name || '',
        quantity: transaction.quantity || 0,
        unitPrice: transaction.unitPrice || 0,
        totalAmount: transaction.totalAmount || 0,
        transactionType: transaction.transactionType || '',
        status: transaction.status || '',
        transactionDate: new Date(transaction.transactionDate).toLocaleDateString(),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any;
  }

  async exportCustomersToExcel(customers: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');

    worksheet.columns = [
      { header: 'Customer ID', key: 'customerIdRef', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Region', key: 'region', width: 15 },
      { header: 'Balance', key: 'balance', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Last Transaction', key: 'lastTransactionDate', width: 18 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB8860B' },
    };

    customers.forEach((customer) => {
      worksheet.addRow({
        customerIdRef: customer.customerIdRef || '',
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        city: customer.city || '',
        region: customer.region || '',
        balance: customer.balance?.balance || 0,
        status: customer.isActive ? 'Active' : 'Inactive',
        lastTransactionDate: customer.lastTransactionDate
          ? new Date(customer.lastTransactionDate).toLocaleDateString()
          : 'N/A',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any;
  }

  async exportPaymentsToExcel(payments: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payments');

    worksheet.columns = [
      { header: 'Customer', key: 'customerName', width: 20 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Bank', key: 'bank', width: 15 },
      { header: 'Reason', key: 'reason', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Request Date', key: 'requestDate', width: 15 },
      { header: 'Approval Date', key: 'approvalDate', width: 15 },
      { header: 'Approved By', key: 'approvedBy', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB8860B' },
    };

    payments.forEach((payment) => {
      worksheet.addRow({
        customerName: payment.customer?.name || '',
        amount: payment.amount || 0,
        bank: payment.bank || '',
        reason: payment.reason || '',
        status: payment.status || '',
        requestDate: new Date(payment.requestDate).toLocaleDateString(),
        approvalDate: payment.approvalDate
          ? new Date(payment.approvalDate).toLocaleDateString()
          : '',
        approvedBy: payment.approvedBy?.fullName || '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any;
  }

  async exportDashboardToPDF(kpis: any, charts: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(24).font('Helvetica-Bold').text('ALEM TRADING Dashboard Report', 40, 40);
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, 40, 75);

      doc.moveTo(40, 90).lineTo(555, 90).stroke();

      doc.fontSize(16).font('Helvetica-Bold').text('Key Performance Indicators', 40, 110);

      const kpiData = [
        ['Total Customers', kpis.totalCustomers || 0],
        ['Total Sales', `$${(kpis.totalSales || 0).toLocaleString()}`],
        ['Total Assets', `$${(kpis.totalAssets || 0).toLocaleString()}`],
        ['Net Profit', `$${(kpis.netProfit || 0).toLocaleString()}`],
        ['Pending Payments', `$${(kpis.pendingPayments || 0).toLocaleString()}`],
        ['Outstanding Credits', `$${(kpis.outstandingCredits || 0).toLocaleString()}`],
        ['Pending Refunds', `$${(kpis.pendingRefunds || 0).toLocaleString()}`],
      ];

      let yPosition = 140;
      kpiData.forEach(([label, value]) => {
        doc.fontSize(11).font('Helvetica').text(`${label}:`, 50, yPosition);
        doc.fontSize(11).font('Helvetica-Bold').text(value, 250, yPosition);
        yPosition += 25;
      });

      doc.moveTo(40, yPosition).lineTo(555, yPosition).stroke();

      doc.fontSize(16).font('Helvetica-Bold').text('Summary', 40, yPosition + 20);
      doc.fontSize(10).font('Helvetica').text(
        `This report provides an overview of key business metrics as of ${new Date().toLocaleDateString()}.`,
        40,
        yPosition + 50,
        { width: 500, align: 'left' }
      );

      doc.end();
    });
  }
}
