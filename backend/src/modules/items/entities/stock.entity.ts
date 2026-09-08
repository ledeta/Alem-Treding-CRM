import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Item } from './item.entity';

@Entity('stock')
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Item, (item) => item.stock, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: 10 })
  lowStockThreshold: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
