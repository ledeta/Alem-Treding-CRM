import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('credit_requests')
@Index(['status'])
export class CreditRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  customer: Customer;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  approvedAmount: number;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  status: string;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  usedAmount: number;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  approvedBy: User;

  @Column({ nullable: true })
  approvalDate: Date;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
