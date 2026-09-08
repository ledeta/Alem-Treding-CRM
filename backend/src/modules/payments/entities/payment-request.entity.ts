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

@Entity('payment_requests')
@Index(['status'])
export class PaymentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  customer: Customer;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    enum: [
      'Telebirr',
      'CBE',
      'Dashen Bank',
      'Awash Bank',
      'Abyssinia Bank',
      'Wegagen Bank',
      'Siinqee Bank',
      'Other',
    ],
  })
  bank: string;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @Column()
  requestDate: Date;

  @Column({ nullable: true })
  requestTime: string;

  @Column({
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  status: string;

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
