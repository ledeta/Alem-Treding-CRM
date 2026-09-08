import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('customer_balances')
export class CustomerBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Customer, (customer) => customer.balance, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  refundAmount: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
