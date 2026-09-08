import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { RefundRequest } from './entities/refund-request.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../auth/entities/user.entity';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto, ApproveRefundDto, RejectRefundDto, CompleteRefundDto } from './dto/update-refund.dto';
import { ItemsService } from '../items/items.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    @InjectRepository(RefundRequest)
    private readonly refundRepository: Repository<RefundRequest>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly itemsService: ItemsService,
    private readonly emailService: EmailService,
  ) {}

  async create(createRefundDto: CreateRefundDto) {
    const { customerId, itemId, quantity, refundAmount, reason, description, createdBy } =
      createRefundDto;

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

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Validate refund amount
    if (refundAmount <= 0) {
      throw new BadRequestException('Refund amount must be greater than 0');
    }

    const refund = this.refundRepository.create({
      customer,
      item,
      quantity,
      refundAmount,
      reason,
      description,
      status: 'Pending',
      createdBy: user,
    });

    const savedRefund = await this.refundRepository.save(refund);
    this.logger.log(`Refund request created: ${savedRefund.id}`);

    return this.findById(savedRefund.id);
  }

  async findById(id: number) {
    const refund = await this.refundRepository.findOne({
      where: { id },
      relations: ['customer', 'item', 'createdBy', 'approvedBy'],
    });

    if (!refund) {
      throw new NotFoundException('Refund request not found');
    }

    return refund;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [refunds, total] = await this.refundRepository.findAndCount({
      relations: ['customer', 'item', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: refunds,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByStatus(
    status: 'Pending' | 'Approved' | 'Rejected' | 'Completed',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [refunds, total] = await this.refundRepository.findAndCount({
      where: { status },
      relations: ['customer', 'item', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: refunds,
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

    const [refunds, total] = await this.refundRepository.findAndCount({
      where: { customer: { id: customerId } },
      relations: ['customer', 'item', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: refunds,
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

    const [refunds, total] = await this.refundRepository.findAndCount({
      where: { item: { id: itemId } },
      relations: ['customer', 'item', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: refunds,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [refunds, total] = await this.refundRepository.findAndCount({
      where: [
        { reason: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
        { customer: { name: ILike(`%${query}%`) } },
        { item: { name: ILike(`%${query}%`) } },
      ],
      relations: ['customer', 'item', 'createdBy', 'approvedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: refunds,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async approve(id: number, approveRefundDto: ApproveRefundDto) {
    const refund = await this.findById(id);

    if (refund.status !== 'Pending') {
      throw new BadRequestException('Only pending refunds can be approved');
    }

    // Validate approver exists
    const approver = await this.userRepository.findOne({
      where: { id: approveRefundDto.approvedBy },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    refund.status = 'Approved';
    refund.approvedBy = approver;
    refund.approvalDate = new Date();
    if (approveRefundDto.notes) {
      refund.notes = approveRefundDto.notes;
    }

    // Update inventory if requested
    if (approveRefundDto.updateInventory) {
      try {
        await this.itemsService.increaseStock(refund.item.id, refund.quantity);
        refund.isInventoryUpdated = true;
      } catch (error) {
        this.logger.error(`Error updating inventory for refund ${id}: ${error.message}`);
        throw new BadRequestException('Failed to update inventory');
      }
    }

    const updatedRefund = await this.refundRepository.save(refund);
    this.logger.log(`Refund approved: ${id}`);

    // Send approval email
    if (refund.customer && refund.customer.email) {
      await this.emailService.sendApprovalNotificationEmail(
        refund.customer.email,
        'Refund',
        'approved',
        {
          amount: `$${refund.refundAmount.toLocaleString()}`,
          reason: refund.reason,
          date: new Date(),
        },
        refund.customer.name,
      );
    }

    return this.findById(updatedRefund.id);
  }

  async reject(id: number, rejectRefundDto: RejectRefundDto) {
    const refund = await this.findById(id);

    if (refund.status !== 'Pending') {
      throw new BadRequestException('Only pending refunds can be rejected');
    }

    // Validate approver exists
    const approver = await this.userRepository.findOne({
      where: { id: rejectRefundDto.approvedBy },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    refund.status = 'Rejected';
    refund.approvedBy = approver;
    refund.approvalDate = new Date();
    refund.notes = rejectRefundDto.notes;

    const updatedRefund = await this.refundRepository.save(refund);
    this.logger.log(`Refund rejected: ${id}`);

    // Send rejection email
    if (refund.customer && refund.customer.email) {
      await this.emailService.sendApprovalNotificationEmail(
        refund.customer.email,
        'Refund',
        'rejected',
        {
          amount: `$${refund.refundAmount.toLocaleString()}`,
          reason: refund.reason,
          date: new Date(),
        },
        refund.customer.name,
      );
    }

    return this.findById(updatedRefund.id);
  }

  async complete(id: number, completeRefundDto: CompleteRefundDto) {
    const refund = await this.findById(id);

    if (refund.status !== 'Approved') {
      throw new BadRequestException('Only approved refunds can be completed');
    }

    refund.status = 'Completed';
    refund.completionDate = new Date();
    if (completeRefundDto.notes) {
      refund.notes = completeRefundDto.notes;
    }

    const updatedRefund = await this.refundRepository.save(refund);
    this.logger.log(`Refund completed: ${id}`);

    return this.findById(updatedRefund.id);
  }

  async update(id: number, updateRefundDto: UpdateRefundDto) {
    const refund = await this.findById(id);

    if (refund.status !== 'Pending') {
      throw new BadRequestException('Only pending refunds can be updated');
    }

    Object.assign(refund, updateRefundDto);
    const updatedRefund = await this.refundRepository.save(refund);

    this.logger.log(`Refund updated: ${id}`);
    return this.findById(updatedRefund.id);
  }

  async delete(id: number) {
    const refund = await this.findById(id);

    if (refund.status !== 'Pending') {
      throw new BadRequestException('Only pending refunds can be deleted');
    }

    await this.refundRepository.remove(refund);
    this.logger.log(`Refund deleted: ${id}`);

    return { message: 'Refund deleted successfully' };
  }

  async getTotalRefundAmount(customerId?: number) {
    let query = this.refundRepository
      .createQueryBuilder('refund')
      .select('SUM(refund.refundAmount)', 'total')
      .where('refund.status IN (:...statuses)', { statuses: ['Approved', 'Completed'] });

    if (customerId) {
      query = query.andWhere('refund.customerId = :customerId', { customerId });
    }

    const result = await query.getRawOne();
    return parseFloat(result.total) || 0;
  }

  async getPendingRefundsCount() {
    return this.refundRepository.count({
      where: { status: 'Pending' },
    });
  }

  async getApprovedRefundsCount() {
    return this.refundRepository.count({
      where: { status: 'Approved' },
    });
  }

  async getCompletedRefundsCount() {
    return this.refundRepository.count({
      where: { status: 'Completed' },
    });
  }

  async getRefundsNotUpdatingInventory() {
    return this.refundRepository.find({
      where: {
        status: 'Approved',
        isInventoryUpdated: false,
      },
      relations: ['customer', 'item'],
      order: { approvalDate: 'ASC' },
    });
  }
}
