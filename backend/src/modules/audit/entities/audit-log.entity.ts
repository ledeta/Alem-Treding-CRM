import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['module'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE';

  @Column({ type: 'varchar', length: 100 })
  module: string;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: any;

  @Column({ type: 'jsonb', nullable: true })
  newValues: any;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 50, default: 'SUCCESS' })
  status: 'SUCCESS' | 'FAILED';

  @CreateDateColumn()
  createdAt: Date;
}
