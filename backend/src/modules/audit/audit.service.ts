import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Like } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';

export interface AuditLogDto {
  userId: number | string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE';
  module: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILED';
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private auditRepository: Repository<AuditLogEntity>,
  ) {}

  async log(auditData: AuditLogDto): Promise<AuditLogEntity> {
    const auditLog = this.auditRepository.create({
      userId: String(auditData.userId),
      action: auditData.action,
      module: auditData.module,
      resourceId: auditData.resourceId,
      oldValues: auditData.oldValues,
      newValues: auditData.newValues,
      description: auditData.description,
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      status: auditData.status || 'SUCCESS',
    });
    return this.auditRepository.save(auditLog);
  }

  async getLogs(filters: {
    userId?: string;
    action?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit: number;
    offset: number;
  }) {
    const query = this.auditRepository.createQueryBuilder('audit');

    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }
    if (filters.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }
    if (filters.status) {
      query.andWhere('audit.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    query.orderBy('audit.createdAt', 'DESC').skip(filters.offset).take(filters.limit);

    const [data, total] = await query.getManyAndCount();
    return {
      data,
      total,
      limit: filters.limit,
      offset: filters.offset,
      pages: Math.ceil(total / filters.limit),
    };
  }

  async getByUser(userId: string, limit: number = 50) {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getByModule(module: string, limit: number = 50) {
    return this.auditRepository.find({
      where: { module },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFailedAttempts(hours: number = 24): Promise<AuditLogEntity[]> {
    const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.auditRepository.find({
      where: {
        status: 'FAILED',
        createdAt: MoreThan(sinceDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getStatistics() {
    const total = await this.auditRepository.count();

    // Get actions summary
    const actionCounts = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    // Get success vs failed
    const statusCounts = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.status')
      .getRawMany();

    // Get top users
    const topUsers = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.userId')
      .orderBy('count', 'DESC')
      .take(10)
      .getRawMany();

    return {
      total,
      byAction: actionCounts.reduce((acc, item) => {
        acc[item.action] = parseInt(item.count);
        return acc;
      }, {}),
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      topUsers,
    };
  }

  async cleanup(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const result = await this.auditRepository.delete({
      createdAt: LessThan(cutoffDate),
    });
    this.logger.log(
      `Deleted ${result.affected} audit logs older than ${daysToKeep} days`
    );
  }
}
