import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Approval } from './entities/approval.entity';
import {
  CreateApprovalDto,
  ApproveApprovalDto,
  ApprovalStatus,
  ApprovalListQueryDto,
} from './dto/approval.dto';

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
  ) {}

  /**
   * Create approval request
   */
  async create(createApprovalDto: CreateApprovalDto): Promise<Approval> {
    const approval = this.approvalRepository.create({
      ...createApprovalDto,
      status: ApprovalStatus.PENDING,
    });

    const savedApproval = await this.approvalRepository.save(approval);
    this.logger.log(
      `Approval created: ${createApprovalDto.type} for customer ${createApprovalDto.customerId}`,
    );

    return this.findById(savedApproval.id);
  }

  /**
   * Get approval by ID
   */
  async findById(id: number): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id },
      relations: ['customer', 'requestedByUser', 'approvedByUser'],
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    return approval;
  }

  /**
   * Get all approvals with filters
   */
  async findAll(query: ApprovalListQueryDto) {
    const { status, type, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }

    if (type) {
      whereCondition.type = type;
    }

    const [approvals, total] = await this.approvalRepository.findAndCount({
      where: whereCondition,
      relations: ['customer', 'requestedByUser', 'approvedByUser'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: approvals,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(userId?: number) {
    const whereCondition: any = {
      status: ApprovalStatus.PENDING,
    };

    if (userId) {
      whereCondition.approvedBy = null; // Not yet assigned to this user
    }

    const approvals = await this.approvalRepository.find({
      where: whereCondition,
      relations: ['customer', 'requestedByUser'],
      order: { createdAt: 'ASC' },
    });

    return approvals;
  }

  /**
   * Approve or reject an approval request
   */
  async processApproval(
    id: number,
    approveDto: ApproveApprovalDto,
  ): Promise<Approval> {
    const approval = await this.findById(id);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `Cannot process approval with status: ${approval.status}`,
      );
    }

    if (approveDto.decision === 'approved') {
      approval.status = ApprovalStatus.APPROVED;
      approval.approvalDate = new Date();
    } else {
      approval.status = ApprovalStatus.REJECTED;
      approval.rejectionReason = approveDto.reason;
    }

    approval.approvedBy = approveDto.approvedBy;

    const updatedApproval = await this.approvalRepository.save(approval);

    this.logger.log(
      `Approval ${approveDto.decision}: ${updatedApproval.type} - ID ${id}`,
    );

    return this.findById(updatedApproval.id);
  }

  /**
   * Bulk approve approvals
   */
  async bulkApprove(
    approvalIds: number[],
    approvedBy: number,
  ): Promise<Approval[]> {
    const approvals = await this.approvalRepository.find({
      where: { id: In(approvalIds), status: ApprovalStatus.PENDING },
    });

    if (approvals.length === 0) {
      throw new BadRequestException('No pending approvals found');
    }

    const updateDate = new Date();

    approvals.forEach((approval) => {
      approval.status = ApprovalStatus.APPROVED;
      approval.approvalDate = updateDate;
      approval.approvedBy = approvedBy;
    });

    const updated = await this.approvalRepository.save(approvals);
    this.logger.log(`Bulk approved ${updated.length} approvals`);

    return updated;
  }

  /**
   * Cancel approval request
   */
  async cancel(id: number, reason?: string): Promise<Approval> {
    const approval = await this.findById(id);

    if (approval.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot cancel an already approved request',
      );
    }

    approval.status = ApprovalStatus.CANCELLED;
    approval.rejectionReason = reason;

    const updated = await this.approvalRepository.save(approval);
    this.logger.log(`Approval cancelled: ${id}`);

    return updated;
  }

  /**
   * Get approval statistics
   */
  async getStatistics() {
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      this.approvalRepository.count({
        where: { status: ApprovalStatus.PENDING },
      }),
      this.approvalRepository.count({
        where: { status: ApprovalStatus.APPROVED },
      }),
      this.approvalRepository.count({
        where: { status: ApprovalStatus.REJECTED },
      }),
    ]);

    // Get breakdown by type
    const approvals = await this.approvalRepository.find();

    const byType = {
      payment: approvals.filter((a) => a.type === 'payment').length,
      credit: approvals.filter((a) => a.type === 'credit').length,
      refund: approvals.filter((a) => a.type === 'refund').length,
    };

    // Calculate average approval time
    const approvedApprovals = await this.approvalRepository.find({
      where: { status: ApprovalStatus.APPROVED },
    });

    let averageApprovalTime = 0;

    if (approvedApprovals.length > 0) {
      const totalTime = approvedApprovals.reduce((sum, a) => {
        const timeDiff =
          a.approvalDate.getTime() - a.createdAt.getTime();
        return sum + timeDiff;
      }, 0);

      averageApprovalTime =
        totalTime / approvedApprovals.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      pendingCount,
      approvedCount,
      rejectedCount,
      byType,
      averageApprovalTime: Math.round(averageApprovalTime * 100) / 100,
    };
  }

  /**
   * Get approvals for a specific customer
   */
  async getCustomerApprovals(customerId: number) {
    const approvals = await this.approvalRepository.find({
      where: { customerId },
      relations: ['requestedByUser', 'approvedByUser'],
      order: { createdAt: 'DESC' },
    });

    return approvals;
  }

  /**
   * Get approvals for a specific time period
   */
  async getApprovalsByDateRange(startDate: Date, endDate: Date) {
    const approvals = await this.approvalRepository.find({
      where: {
        createdAt: new (require('typeorm')).Between(startDate, endDate),
      },
      relations: ['customer', 'requestedByUser', 'approvedByUser'],
      order: { createdAt: 'DESC' },
    });

    return approvals;
  }

  /**
   * Update approval notes
   */
  async updateNotes(id: number, notes: string): Promise<Approval> {
    const approval = await this.findById(id);

    approval.notes = notes;
    const updated = await this.approvalRepository.save(approval);

    this.logger.log(`Approval notes updated: ${id}`);
    return updated;
  }
}
