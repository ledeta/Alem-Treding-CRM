import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Item } from '../../items/entities/item.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('sales_transactions')
@Index(['transactionDate'])
@Index(['status'])
@Index(['transactionType'])
export class SalesTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionId: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  customer: Customer;

  @ManyToOne(() => Item, { onDelete: 'RESTRICT' })
  item: Item;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({
    enum: ['Sale', 'Refund', 'Credit', 'Payment'],
    default: 'Sale',
  })
  transactionType: string;

  @Column({
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
  })
  status: string;

  @Column()
  transactionDate: Date;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ nullable: true })
  referenceId: number; // Reference to payment, refund, or credit ID

  @Column({ nullable: true })
  referenceType: string; // 'payment', 'refund', 'credit'

  @Column({
    enum: ['Warehouse', 'Shop'],
    default: 'Warehouse',
  })
  branch: string;

  @Column({ default: false })
  isImported: boolean; // Track if imported from Excel

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
