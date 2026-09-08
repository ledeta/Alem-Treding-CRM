import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { SalesTransaction } from './entities/sales-transaction.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CustomerBalance } from '../customers/entities/customer-balance.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../auth/entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ItemsService } from '../items/items.service';
import { SalesImportRowDto } from '../excel/dtos/sales-import.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(SalesTransaction)
    private readonly transactionRepository: Repository<SalesTransaction>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerBalance)
    private readonly balanceRepository: Repository<CustomerBalance>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly itemsService: ItemsService,
  ) {}

  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  async recordSale(createTransactionDto: CreateTransactionDto) {
    const {
      customerId,
      itemId,
      quantity,
      unitPrice,
      transactionType,
      transactionDate,
      discountAmount,
      taxAmount,
      notes,
      createdBy,
      referenceId,
      referenceType,
    } = createTransactionDto;

    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate item exists
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['stock'],
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: createdBy },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate quantities
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (unitPrice <= 0) {
      throw new BadRequestException('Unit price must be greater than 0');
    }

    // Check stock availability for sales
    const stockQuantity = (item.stock as any)?.quantityOnHand || (item.stock as any)?.quantity || 0;
    if (transactionType === 'Sale' && stockQuantity < quantity) {
      throw new BadRequestException('Insufficient stock for this transaction');
    }

    // Calculate total amount
    const totalAmount =
      quantity * unitPrice - (discountAmount || 0) + (taxAmount || 0);

    // Create transaction
    const transaction = this.transactionRepository.create({
      transactionId: this.generateTransactionId(),
      customer,
      item,
      quantity,
      unitPrice,
      totalAmount,
      transactionType,
      status: 'Pending',
      transactionDate: new Date(transactionDate),
      discountAmount: discountAmount || 0,
      taxAmount: taxAmount || 0,
      notes,
      createdBy: user,
      referenceId,
      referenceType,
    });

    // Update stock if it's a sale
    if (transactionType === 'Sale') {
      try {
        await this.itemsService.decreaseStock(itemId, quantity);
      } catch (error) {
        throw new BadRequestException(`Stock update failed: ${error.message}`);
      }
    }

    // For refunds, increase stock
    if (transactionType === 'Refund') {
      try {
        await this.itemsService.increaseStock(itemId, quantity);
      } catch (error) {
        throw new BadRequestException(`Stock update failed: ${error.message}`);
      }
    }

    const savedTransaction = await this.transactionRepository.save(transaction);
    this.logger.log(`Transaction recorded: ${savedTransaction.transactionId}`);

    return this.findById(savedTransaction.id);
  }

  async findById(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['customer', 'item', 'createdBy'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findByTransactionId(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['customer', 'item', 'createdBy'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      relations: ['customer', 'item', 'createdBy'],
      skip,
      take: limit,
      order: { transactionDate: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByCustomer(
    customerId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { customer: { id: customerId } },
      relations: ['customer', 'item', 'createdBy'],
      skip,
      take: limit,
      order: { transactionDate: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByItem(
    itemId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Validate item exists
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { item: { id: itemId } },
      relations: ['customer', 'item', 'createdBy'],
      skip,
      take: limit,
      order: { transactionDate: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByType(
    transactionType: 'Sale' | 'Refund' | 'Credit' | 'Payment',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { transactionType },
      relations: ['customer', 'item', 'createdBy'],
      skip,
      take: limit,
      order: { transactionDate: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByStatus(
    status: 'Pending' | 'Completed' | 'Cancelled',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { status },
      relations: ['customer', 'item', 'createdBy'],
      skip,
      take: limit,
      order: { transactionDate: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: {
        transactionDate: Between(startDate, endDate),
      },
      relations: ['customer', 'item', 'createdBy'],
      skip,
      take: limit,
      order: { transactionDate: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getTransactionHistory(
    customerId: number,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.customerId = :customerId', { customerId });

    if (startDate && endDate) {
      query = query.andWhere(
        'transaction.transactionDate BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    query = query
      .leftJoinAndSelect('transaction.item', 'item')
      .leftJoinAndSelect('transaction.customer', 'customer')
      .leftJoinAndSelect('transaction.createdBy', 'createdBy')
      .orderBy('transaction.transactionDate', 'DESC')
      .skip(skip)
      .take(limit);

    const [transactions, total] = await query.getManyAndCount();

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: number, status: 'Pending' | 'Completed' | 'Cancelled') {
    const transaction = await this.findById(id);

    transaction.status = status;
    const updatedTransaction = await this.transactionRepository.save(transaction);

    this.logger.log(`Transaction status updated: ${id}`);
    return this.findById(updatedTransaction.id);
  }

  async getTotalSalesAmount(customerId?: number, startDate?: Date, endDate?: Date) {
    let query = this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.totalAmount)', 'total')
      .where('transaction.transactionType = :type', { type: 'Sale' })
      .andWhere('transaction.status = :status', { status: 'Completed' });

    if (customerId) {
      query = query.andWhere('transaction.customerId = :customerId', { customerId });
    }

    if (startDate && endDate) {
      query = query.andWhere(
        'transaction.transactionDate BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    const result = await query.getRawOne();
    return parseFloat(result.total) || 0;
  }

  async getTotalRefundAmount(customerId?: number, startDate?: Date, endDate?: Date) {
    let query = this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.totalAmount)', 'total')
      .where('transaction.transactionType = :type', { type: 'Refund' })
      .andWhere('transaction.status = :status', { status: 'Completed' });

    if (customerId) {
      query = query.andWhere('transaction.customerId = :customerId', { customerId });
    }

    if (startDate && endDate) {
      query = query.andWhere(
        'transaction.transactionDate BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    const result = await query.getRawOne();
    return parseFloat(result.total) || 0;
  }

  async getTransactionCount(transactionType?: string, status?: string) {
    let query = this.transactionRepository.createQueryBuilder('transaction');

    if (transactionType) {
      query = query.where('transaction.transactionType = :type', {
        type: transactionType,
      });
    }

    if (status) {
      if (transactionType) {
        query = query.andWhere('transaction.status = :status', { status });
      } else {
        query = query.where('transaction.status = :status', { status });
      }
    }

    return query.getCount();
  }

  async getDailyReport(startDate: Date, endDate: Date) {
    const transactions = await this.transactionRepository.find({
      where: {
        transactionDate: Between(startDate, endDate),
      },
      relations: ['customer', 'item'],
    });

    // Group by date
    const dailyReport = {};

    transactions.forEach((transaction) => {
      const dateKey = transaction.transactionDate.toISOString().split('T')[0];

      if (!dailyReport[dateKey]) {
        dailyReport[dateKey] = {
          date: dateKey,
          sales: 0,
          refunds: 0,
          credits: 0,
          payments: 0,
          totalAmount: 0,
          transactionCount: 0,
        };
      }

      if (transaction.transactionType === 'Sale') {
        dailyReport[dateKey].sales += 1;
      } else if (transaction.transactionType === 'Refund') {
        dailyReport[dateKey].refunds += 1;
      } else if (transaction.transactionType === 'Credit') {
        dailyReport[dateKey].credits += 1;
      } else if (transaction.transactionType === 'Payment') {
        dailyReport[dateKey].payments += 1;
      }

      dailyReport[dateKey].totalAmount += parseFloat(
        transaction.totalAmount.toString(),
      );
      dailyReport[dateKey].transactionCount += 1;
    });

    return Object.values(dailyReport);
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: [
        { transactionId: ILike(`%${query}%`) },
        { customer: { name: ILike(`%${query}%`) } },
        { item: { name: ILike(`%${query}%`) } },
        { notes: ILike(`%${query}%`) },
      ],
      relations: ['customer', 'item', 'createdBy'],
      skip,
      take: limit,
      order: { transactionDate: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Bulk import sales transactions from Excel rows
   */
  async bulkImportSalesTransactions(
    rows: SalesImportRowDto[],
    currentUserId: number,
  ): Promise<{
    successCount: number;
    failCount: number;
    errors: Array<{ rowIndex: number; rowData: any; error: string }>;
    categorySummary: Record<string, number>;
    branchSummary: Record<string, number>;
    salesPersonSummary: Record<string, number>;
  }> {
    const results = {
      successCount: 0,
      failCount: 0,
      errors: [] as Array<{ rowIndex: number; rowData: any; error: string }>,
      categorySummary: {} as Record<string, number>,
      branchSummary: {} as Record<string, number>,
      salesPersonSummary: {} as Record<string, number>,
    };

    // Get current user for tracking
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // Find or create customer
        let customer = await this.customerRepository.findOne({
          where: { name: ILike(row.customerName) },
        });

        if (!customer) {
          // Create new customer
          customer = this.customerRepository.create({
            name: row.customerName,
            phone: '',
            address: `${row.branch}`,
            email: '',
            city: '',
            isActive: true,
            source: 'Excel Import',
          });
          customer = await this.customerRepository.save(customer);
          
          // Create customer balance record
          const balance = this.balanceRepository.create({
            customer,
            balance: 0,
            creditAmount: 0,
            refundAmount: 0,
          });
          await this.balanceRepository.save(balance);
          
          this.logger.log(`Created new customer: ${customer.name} with balance record`);
        }

        // Find or create item
        let item = await this.itemRepository.findOne({
          where: { name: ILike(row.itemName) },
          relations: ['stock'],
        });

        if (!item) {
          // Create new item with auto-detected category
          // First, we need to create the item and stock
          item = this.itemRepository.create({
            name: row.itemName,
            sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            category: this.detectCategoryFromItemName(row.itemName),
            purchasePrice: row.sellingPrice * 0.7, // Estimate purchase price as 70% of selling price
            sellingPrice: row.sellingPrice,
            isActive: true,
          });

          // Save item (stock will be created by the entity relationship)
          item = await this.itemRepository.save(item);
          this.logger.log(`Created new item: ${item.name} in category: ${item.category}`);
        }

        // Find user by name (salesperson)
        let salesperson = await this.userRepository.findOne({
          where: [
            { fullName: ILike(row.soldBy) },
            { username: ILike(row.soldBy) },
          ],
        });

        if (!salesperson) {
          // If salesperson not found, use current user
          salesperson = currentUser;
          this.logger.warn(`Salesperson "${row.soldBy}" not found, using current user`);
        }

        // Parse transaction date
        let transactionDate = new Date(row.date);
        if (isNaN(transactionDate.getTime())) {
          transactionDate = new Date();
        }

        // Create transaction
        const transaction = this.transactionRepository.create({
          transactionId: this.generateTransactionId(),
          customer,
          item,
          quantity: row.quantity,
          unitPrice: row.sellingPrice,
          totalAmount: row.quantity * row.sellingPrice - (row.discount || 0) + (row.tax || 0),
          transactionType: 'Sale',
          status: 'Completed',
          transactionDate,
          discountAmount: row.discount || 0,
          taxAmount: row.tax || 0,
          notes: `Imported from Excel. Branch: ${row.branch}. ${row.notes || ''}`,
          createdBy: salesperson,
          referenceType: 'bulk-import',
        });

        // Update stock
        try {
          await this.itemsService.decreaseStock(item.id, row.quantity);
        } catch (stockError) {
          this.logger.warn(`Stock update warning for item ${item.id}: ${stockError.message}`);
        }

        // Save transaction
        await this.transactionRepository.save(transaction);
        results.successCount++;

        // Update summaries
        const category = item.category || 'General';
        results.categorySummary[category] = (results.categorySummary[category] || 0) + row.quantity;
        results.branchSummary[row.branch] = (results.branchSummary[row.branch] || 0) + 1;
        results.salesPersonSummary[row.soldBy] = (results.salesPersonSummary[row.soldBy] || 0) + 1;

        this.logger.log(`Imported transaction: ${transaction.transactionId}`);
      } catch (error) {
        results.failCount++;
        results.errors.push({
          rowIndex: i + 2, // +2 because rows are 0-indexed in array but 1-indexed in Excel (+ 1 for header)
          rowData: row,
          error: error instanceof Error ? error.message : String(error),
        });
        this.logger.error(`Row ${i + 2} import error: ${error}`);
      }
    }

    return results;
  }

  /**
   * Detect category from item name
   */
  private detectCategoryFromItemName(itemName: string): string {
    const name = itemName.toLowerCase();

    const categories: Record<string, string[]> = {
      'Grains & Cereals': ['rice', 'wheat', 'maize', 'corn', 'barley', 'grain', 'cereal'],
      'Legumes': ['bean', 'lentil', 'pea', 'chickpea', 'pulse'],
      'Oils & Fats': ['oil', 'ghee', 'butter', 'fat'],
      'Spices': ['spice', 'salt', 'pepper', 'cumin', 'turmeric'],
      'Vegetables': ['vegetable', 'onion', 'garlic', 'potato', 'tomato', 'carrot'],
      'Fruits': ['fruit', 'apple', 'banana', 'orange', 'mango'],
      'Dairy': ['milk', 'cheese', 'yogurt', 'dairy'],
      'Meat & Fish': ['meat', 'chicken', 'fish', 'beef', 'lamb'],
      'Bakery': ['bread', 'flour', 'bake'],
      'Beverages': ['tea', 'coffee', 'juice', 'beverage', 'drink'],
      'General': ['item', 'product', 'goods'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => name.includes(keyword))) {
        return category;
      }
    }

    return 'General';
  }
}
