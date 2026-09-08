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
import { Item } from '../../items/entities/item.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('refund_requests')
@Index(['status'])
export class RefundRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  customer: Customer;

  @ManyToOne(() => Item, { onDelete: 'RESTRICT' })
  item: Item;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  refundAmount: number;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending',
  })
  status: string;

  @Column({ default: false })
  isInventoryUpdated: boolean;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  approvedBy: User;

  @Column({ nullable: true })
  approvalDate: Date;

  @Column({ nullable: true })
  completionDate: Date;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
