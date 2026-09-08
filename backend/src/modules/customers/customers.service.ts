import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerBalance } from './entities/customer-balance.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerBalance)
    private readonly balanceRepository: Repository<CustomerBalance>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    // Check if customer with this ID ref already exists
    if (createCustomerDto.customerIdRef) {
      const existing = await this.customerRepository.findOne({
        where: { customerIdRef: createCustomerDto.customerIdRef },
      });
      if (existing) {
        return existing; // Return existing customer (avoid duplicates)
      }
    }

    const customer = this.customerRepository.create(createCustomerDto);
    const savedCustomer = await this.customerRepository.save(customer);

    // Create customer balance record
    const balance = this.balanceRepository.create({
      customer: savedCustomer,
    });
    await this.balanceRepository.save(balance);

    this.logger.log(`Customer created: ${createCustomerDto.name}`);
    return this.findById(savedCustomer.id);
  }

  async bulkCreate(customers: Array<{ name: string }>) {
    const created: any[] = [];
    
    for (const customerData of customers) {
      try {
        const trimmedName = customerData.name?.trim();
        
        // Skip empty names
        if (!trimmedName || trimmedName.length === 0) {
          continue;
        }

        // Check if customer already exists (by name)
        const existing = await this.customerRepository.findOne({
          where: { name: trimmedName },
        });

        if (existing) {
          this.logger.log(`Customer already exists: ${trimmedName}`);
          created.push({
            id: existing.id,
            name: existing.name,
            isNew: false,
          });
          continue;
        }

        // Create new customer
        const customer = this.customerRepository.create({
          name: trimmedName,
          isActive: true,
        });
        const savedCustomer = await this.customerRepository.save(customer);

        // Create customer balance record
        const balance = this.balanceRepository.create({
          customer: savedCustomer,
          balance: 0,
          creditAmount: 0,
          refundAmount: 0,
        });
        await this.balanceRepository.save(balance);

        this.logger.log(`Customer created: ${trimmedName}`);
        created.push({
          id: savedCustomer.id,
          name: savedCustomer.name,
          isNew: true,
        });
      } catch (error) {
        this.logger.error(`Error creating customer ${customerData.name}:`, error);
      }
    }

    return {
      success: true,
      message: `Successfully created/found ${created.length} customers`,
      customersAdded: created.length,
      customers: created,
    };
  }

  async findById(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['balance'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByPhone(phone: string) {
    return this.customerRepository.findOne({
      where: { phone },
      relations: ['balance'],
    });
  }

  async findByCustomerIdRef(customerIdRef: string) {
    return this.customerRepository.findOne({
      where: { customerIdRef },
      relations: ['balance'],
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    this.logger.log(`findAll called - page: ${page}, limit: ${limit}`);
    const skip = (page - 1) * limit;

    const [customers, total] = await this.customerRepository.findAndCount({
      relations: ['balance'],
      where: { isActive: true },
      skip,
      take: limit,
      order: { lastTransactionDate: 'DESC' },
    });

    this.logger.log(`Found ${customers.length} customers, total: ${total}`);

    // Ensure all customers have balance records
    for (const customer of customers) {
      if (!customer.balance) {
        this.logger.log(`Creating missing balance record for customer ${customer.id}`);
        const balance = this.balanceRepository.create({
          customer,
          balance: 0,
          creditAmount: 0,
          refundAmount: 0,
        });
        await this.balanceRepository.save(balance);
        customer.balance = balance;
      }
    }

    // Calculate totalPurchases for each customer
    const customersWithTotals = await Promise.all(
      customers.map(async (customer) => {
        try {
          const result = await this.customerRepository.manager.query(`
            SELECT COALESCE(SUM(CAST("totalAmount" as NUMERIC)), 0) as "totalPurchases"
            FROM sales_transactions
            WHERE "customerId" = $1 AND "status" = 'Completed' AND "transactionType" = 'Sale'
          `, [customer.id]);
          
          return {
            ...customer,
            totalPurchases: parseFloat(result[0]?.totalPurchases || 0),
          };
        } catch (error) {
          this.logger.error(`Error calculating totals for customer ${customer.id}:`, error);
          return {
            ...customer,
            totalPurchases: 0,
          };
        }
      })
    );

    this.logger.log(`Returning ${customersWithTotals.length} customers with totals`);

    return {
      data: customersWithTotals,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async search(
    query: string,
    searchField: 'name' | 'phone' | 'customerIdRef' = 'name',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    
    // Build where condition safely
    if (searchField === 'name') {
      whereCondition.name = Like(`%${query}%`);
    } else if (searchField === 'phone') {
      whereCondition.phone = Like(`%${query}%`);
    } else if (searchField === 'customerIdRef') {
      whereCondition.customerIdRef = Like(`%${query}%`);
    }

    const [customers, total] = await this.customerRepository.findAndCount({
      where: whereCondition,
      relations: ['balance'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Ensure all customers have balance records
    for (const customer of customers) {
      if (!customer.balance) {
        this.logger.log(`Creating missing balance record for customer ${customer.id}`);
        const balance = this.balanceRepository.create({
          customer,
          balance: 0,
          creditAmount: 0,
          refundAmount: 0,
        });
        await this.balanceRepository.save(balance);
        customer.balance = balance;
      }
    }

    // Calculate totalPurchases for each customer
    const customersWithTotals = await Promise.all(
      customers.map(async (customer) => {
        try {
          const result = await this.customerRepository.manager.query(`
            SELECT COALESCE(SUM(CAST("totalAmount" as NUMERIC)), 0) as "totalPurchases"
            FROM sales_transactions
            WHERE "customerId" = $1 AND "status" = 'Completed' AND "transactionType" = 'Sale'
          `, [customer.id]);
          
          return {
            ...customer,
            totalPurchases: parseFloat(result[0]?.totalPurchases || 0),
          };
        } catch (error) {
          this.logger.error(`Error calculating total purchases for customer ${customer.id}: ${error}`);
          return {
            ...customer,
            totalPurchases: 0,
          };
        }
      })
    );

    return {
      data: customersWithTotals,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findById(id);

    Object.assign(customer, updateCustomerDto);
    const updatedCustomer = await this.customerRepository.save(customer);

    this.logger.log(`Customer updated: ${customer.name}`);
    return updatedCustomer;
  }

  async updateBalance(
    customerId: number,
    balanceChange: number,
    creditChange: number = 0,
    refundChange: number = 0,
  ) {
    const balance = await this.balanceRepository.findOne({
      where: { customer: { id: customerId } },
    });

    if (!balance) {
      throw new NotFoundException('Customer balance not found');
    }

    balance.balance += balanceChange;
    balance.creditAmount += creditChange;
    balance.refundAmount += refundChange;

    await this.balanceRepository.save(balance);
    this.logger.log(`Customer ${customerId} balance updated`);

    return balance;
  }

  async getCustomerProfile(id: number) {
    const customer = await this.findById(id);
    // This will be extended with purchase history, etc.
    return customer;
  }

  async deactivate(id: number) {
    const customer = await this.findById(id);
    customer.isActive = false;
    const updated = await this.customerRepository.save(customer);

    this.logger.log(`Customer deactivated: ${customer.name}`);
    return updated;
  }

  async countActiveCustomers() {
    return this.customerRepository.count({
      where: { isActive: true },
    });
  }

  async getNoVisitCustomers(days: number = 15, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const [customers, total] = await this.customerRepository.findAndCount({
      where: {
        isActive: true,
      },
      relations: ['balance'],
      skip,
      take: limit,
    });

    // Filter customers with no visits in the specified days
    const noVisitCustomers = customers.filter(
      (c) => !c.lastTransactionDate || c.lastTransactionDate < cutoffDate,
    );

    return {
      data: noVisitCustomers,
      total: noVisitCustomers.length,
      page,
      limit,
    };
  }
}
