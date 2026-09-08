import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Stock } from './stock.entity';

@Entity('items')
@Index(['sku'])
@Index(['category'])
@Index(['isActive'])
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  sku: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sellingPrice: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Stock, (stock) => stock.item, {
    cascade: true,
    eager: true,
  })
  stock: Stock;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
