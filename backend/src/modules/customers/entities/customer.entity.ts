import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { CustomerBalance } from './customer-balance.entity';

@Entity('customers')
@Index(['name'])
@Index(['phone'])
@Index(['customerIdRef'])
@Index(['isActive'])
@Index(['lastTransactionDate'])
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  customerIdRef: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  region: string;

  @Column({ default: 'Ethiopia' })
  country: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  source: string; // 'Excel Import', 'Manual Entry'

  @Column({ nullable: true })
  lastTransactionDate: Date;

  @OneToOne(() => CustomerBalance, (balance) => balance.customer, {
    cascade: true,
    eager: true,
  })
  balance: CustomerBalance;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
