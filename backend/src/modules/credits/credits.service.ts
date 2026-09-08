import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { CreditRequest } from './entities/credit-request.entity';
import { Customer } from '../customers/entities/customer.entity';
import { User } from '../auth/entities/user.entity';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto, ApproveCreditDto, RejectCreditDto, UseCreditDto } from './dto/update-credit.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    @InjectRepository(CreditRequest)
    private readonly creditRepository: Repository<CreditRequest>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async create(createCreditDto: CreateCreditDto) {
    const { customerId, requestedAmount, reason, description, expiryDate, createdBy } =
      createCreditDto;

    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: createdBy },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate amount
    if (requestedAmount <= 0) {
      throw new BadRequestException('Requested amount must be greater than 0');
    }

    const credit = this.creditRepository.create({
      customer,
      requestedAmount,
      reason,
      description,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: 'Pending',
      createdBy: user,
    });

    const savedCredit = await this.creditRepository.save(credit);
    this.logger.log(`Credit request created: ${savedCredit.id}`);

    return this.findById(savedCredit.id);
  }

  async findById(id: number) {
    const credit = await this.creditRepository.findOne({
      where: { id },
      relations: ['customer', 'createdBy', 'approvedBy'],
    });

    if (!credit) {
      throw new NotFoundException('Credit request not found');
    }

    return credit;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [credits, total] = await this.creditRepository.findAndCount({
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: credits,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByStatus(
    status: 'Pending' | 'Approved' | 'Rejected',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [credits, total] = await this.creditRepository.findAndCount({
      where: { status },
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: credits,
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

    const [credits, total] = await this.creditRepository.findAndCount({
      where: { customer: { id: customerId } },
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: credits,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [credits, total] = await this.creditRepository.findAndCount({
      where: [
        { reason: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
        { customer: { name: ILike(`%${query}%`) } },
      ],
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: credits,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async approve(id: number, approveCreditDto: ApproveCreditDto) {
    const credit = await this.findById(id);

    if (credit.status !== 'Pending') {
      throw new BadRequestException('Only pending credit requests can be approved');
    }

    // Validate approver exists
    const approver = await this.userRepository.findOne({
      where: { id: approveCreditDto.approvedBy },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    // Validate approved amount
    if (approveCreditDto.approvedAmount <= 0) {
      throw new BadRequestException('Approved amount must be greater than 0');
    }

    if (approveCreditDto.approvedAmount > credit.requestedAmount) {
      throw new BadRequestException('Approved amount cannot exceed requested amount');
    }

    credit.status = 'Approved';
    credit.approvedAmount = approveCreditDto.approvedAmount;
    credit.approvedBy = approver;
    credit.approvalDate = new Date();
    if (approveCreditDto.expiryDate) {
      credit.expiryDate = new Date(approveCreditDto.expiryDate);
    }
    if (approveCreditDto.notes) {
      credit.notes = approveCreditDto.notes;
    }

    const updatedCredit = await this.creditRepository.save(credit);
    this.logger.log(`Credit request approved: ${id}`);

    // Send approval email
    if (credit.customer && credit.customer.email) {
      await this.emailService.sendApprovalNotificationEmail(
        credit.customer.email,
        'Credit',
        'approved',
        {
          amount: `$${credit.approvedAmount.toLocaleString()}`,
          reason: credit.reason,
          date: new Date(),
        },
        credit.customer.name,
      );
    }

    return this.findById(updatedCredit.id);
  }

  async reject(id: number, rejectCreditDto: RejectCreditDto) {
    const credit = await this.findById(id);

    if (credit.status !== 'Pending') {
      throw new BadRequestException('Only pending credit requests can be rejected');
    }

    // Validate approver exists
    const approver = await this.userRepository.findOne({
      where: { id: rejectCreditDto.approvedBy },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    credit.status = 'Rejected';
    credit.approvedBy = approver;
    credit.approvalDate = new Date();
    credit.notes = rejectCreditDto.notes;

    const updatedCredit = await this.creditRepository.save(credit);
    this.logger.log(`Credit request rejected: ${id}`);

    // Send rejection email
    if (credit.customer && credit.customer.email) {
      await this.emailService.sendApprovalNotificationEmail(
        credit.customer.email,
        'Credit',
        'rejected',
        {
          amount: `$${credit.requestedAmount.toLocaleString()}`,
          reason: credit.reason,
          date: new Date(),
        },
        credit.customer.name,
      );
    }

    return this.findById(updatedCredit.id);
  }

  async update(id: number, updateCreditDto: UpdateCreditDto) {
    const credit = await this.findById(id);

    if (credit.status !== 'Pending') {
      throw new BadRequestException('Only pending credit requests can be updated');
    }

    Object.assign(credit, updateCreditDto);
    const updatedCredit = await this.creditRepository.save(credit);

    this.logger.log(`Credit request updated: ${id}`);
    return this.findById(updatedCredit.id);
  }

  async useCredit(id: number, useCreditDto: UseCreditDto) {
    const credit = await this.findById(id);

    if (credit.status !== 'Approved') {
      throw new BadRequestException('Only approved credits can be used');
    }

    // Validate amount
    if (useCreditDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const availableCredit = credit.approvedAmount - credit.usedAmount;
    if (useCreditDto.amount > availableCredit) {
      throw new BadRequestException('Insufficient credit available');
    }

    // Check if credit is expired
    if (credit.expiryDate && new Date() > credit.expiryDate) {
      throw new BadRequestException('Credit has expired');
    }

    credit.usedAmount = parseFloat(
      (parseFloat(credit.usedAmount.toString()) + useCreditDto.amount).toFixed(2),
    );

    const updatedCredit = await this.creditRepository.save(credit);
    this.logger.log(`Credit used: ${id}, amount: ${useCreditDto.amount}`);

    return this.findById(updatedCredit.id);
  }

  async getAvailableCredit(customerId: number) {
    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const credits = await this.creditRepository.find({
      where: { customer: { id: customerId }, status: 'Approved' },
    });

    let totalAvailable = 0;
    credits.forEach((credit) => {
      if (!credit.expiryDate || new Date() <= credit.expiryDate) {
        const available = credit.approvedAmount - credit.usedAmount;
        totalAvailable += available;
      }
    });

    return { customerId, totalAvailable };
  }

  async resetCredit(id: number) {
    const credit = await this.findById(id);

    if (credit.status !== 'Approved') {
      throw new BadRequestException('Only approved credits can be reset');
    }

    credit.usedAmount = 0;
    const updatedCredit = await this.creditRepository.save(credit);

    this.logger.log(`Credit reset: ${id}`);
    return this.findById(updatedCredit.id);
  }

  async delete(id: number) {
    const credit = await this.findById(id);

    if (credit.status !== 'Pending') {
      throw new BadRequestException('Only pending credit requests can be deleted');
    }

    await this.creditRepository.remove(credit);
    this.logger.log(`Credit request deleted: ${id}`);

    return { message: 'Credit request deleted successfully' };
  }

  async getPendingCreditsCount() {
    return this.creditRepository.count({
      where: { status: 'Pending' },
    });
  }

  async getApprovedCreditsCount() {
    return this.creditRepository.count({
      where: { status: 'Approved' },
    });
  }

  async getTotalApprovedCredits() {
    const result = await this.creditRepository
      .createQueryBuilder('credit')
      .select('SUM(credit.approvedAmount)', 'total')
      .where('credit.status = :status', { status: 'Approved' })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getExpiringCredits(daysUntilExpiry: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

    return this.creditRepository.find({
      where: {
        status: 'Approved',
        expiryDate: Between(new Date(), futureDate),
      },
      relations: ['customer'],
      order: { expiryDate: 'ASC' },
    });
  }
}
