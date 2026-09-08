import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('approvals')
@Index(['status'])
@Index(['type'])
@Index(['customerId'])
@Index(['createdAt'])
export class Approval {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'pending' }) // pending, approved, rejected, cancelled
  status: string;

  @Column({ default: 'payment' }) // payment, credit, refund
  type: string;

  @Column()
  relatedId: number; // ID of related payment/credit/refund record

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  customerId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedBy' })
  requestedByUser: User;

  @Column()
  requestedBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approvedByUser: User;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ nullable: true })
  approvalDate: Date;

  @Column({ nullable: true, type: 'text' })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
