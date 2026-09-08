import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { PaymentRequest } from './entities/payment-request.entity';
import { Customer } from '../customers/entities/customer.entity';
import { User } from '../auth/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, ApprovePaymentDto, RejectPaymentDto } from './dto/update-payment.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentRequest)
    private readonly paymentRepository: Repository<PaymentRequest>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { customerId, amount, bank, reason, requestDate, requestTime, createdBy } =
      createPaymentDto;

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
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const payment = this.paymentRepository.create({
      customer,
      amount,
      bank,
      reason,
      requestDate: new Date(requestDate),
      requestTime,
      status: 'Pending',
      createdBy: user,
    });

    const savedPayment = await this.paymentRepository.save(payment);
    this.logger.log(`Payment request created: ${savedPayment.id}`);

    return this.findById(savedPayment.id);
  }

  async findById(id: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['customer', 'createdBy', 'approvedBy'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: payments,
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

    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { status },
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: payments,
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

    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { customer: { id: customerId } },
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: payments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByBank(
    bank: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { bank },
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: payments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      where: [
        { reason: ILike(`%${query}%`) },
        { bank: ILike(`%${query}%`) },
        { customer: { name: ILike(`%${query}%`) } },
      ],
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: payments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async approve(id: number, approvePaymentDto: ApprovePaymentDto) {
    const payment = await this.findById(id);

    if (payment.status !== 'Pending') {
      throw new BadRequestException('Only pending payments can be approved');
    }

    // Validate approver exists
    const approver = await this.userRepository.findOne({
      where: { id: approvePaymentDto.approvedBy },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    payment.status = 'Approved';
    payment.approvedBy = approver;
    payment.approvalDate = new Date();
    if (approvePaymentDto.notes) {
      payment.notes = approvePaymentDto.notes;
    }

    const updatedPayment = await this.paymentRepository.save(payment);
    this.logger.log(`Payment approved: ${id}`);

    // Send approval email
    if (payment.customer && payment.customer.email) {
      await this.emailService.sendApprovalNotificationEmail(
        payment.customer.email,
        'Payment',
        'approved',
        {
          amount: `$${payment.amount.toLocaleString()}`,
          reason: payment.reason,
          date: new Date(),
        },
        payment.customer.name,
      );
    }

    return this.findById(updatedPayment.id);
  }

  async reject(id: number, rejectPaymentDto: RejectPaymentDto) {
    const payment = await this.findById(id);

    if (payment.status !== 'Pending') {
      throw new BadRequestException('Only pending payments can be rejected');
    }

    // Validate approver exists
    const approver = await this.userRepository.findOne({
      where: { id: rejectPaymentDto.approvedBy },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    payment.status = 'Rejected';
    payment.approvedBy = approver;
    payment.approvalDate = new Date();
    payment.notes = rejectPaymentDto.notes;

    const updatedPayment = await this.paymentRepository.save(payment);
    this.logger.log(`Payment rejected: ${id}`);

    // Send rejection email
    if (payment.customer && payment.customer.email) {
      await this.emailService.sendApprovalNotificationEmail(
        payment.customer.email,
        'Payment',
        'rejected',
        {
          amount: `$${payment.amount.toLocaleString()}`,
          reason: payment.reason,
          date: new Date(),
        },
        payment.customer.name,
      );
    }

    return this.findById(updatedPayment.id);
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findById(id);

    if (payment.status !== 'Pending') {
      throw new BadRequestException('Only pending payments can be updated');
    }

    Object.assign(payment, updatePaymentDto);
    const updatedPayment = await this.paymentRepository.save(payment);

    this.logger.log(`Payment updated: ${id}`);
    return this.findById(updatedPayment.id);
  }

  async delete(id: number) {
    const payment = await this.findById(id);

    if (payment.status !== 'Pending') {
      throw new BadRequestException('Only pending payments can be deleted');
    }

    await this.paymentRepository.remove(payment);
    this.logger.log(`Payment deleted: ${id}`);

    return { message: 'Payment deleted successfully' };
  }

  async getTotalApprovedPayments(customerId: number) {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.customerId = :customerId', { customerId })
      .andWhere('payment.status = :status', { status: 'Approved' })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getPendingPaymentsCount() {
    return this.paymentRepository.count({
      where: { status: 'Pending' },
    });
  }

  async getApprovedPaymentsCount() {
    return this.paymentRepository.count({
      where: { status: 'Approved' },
    });
  }

  async getRejectedPaymentsCount() {
    return this.paymentRepository.count({
      where: { status: 'Rejected' },
    });
  }

  async getPaymentsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      where: {
        requestDate: Between(startDate, endDate),
      },
      relations: ['customer', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { requestDate: 'DESC' },
    });

    return {
      data: payments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
