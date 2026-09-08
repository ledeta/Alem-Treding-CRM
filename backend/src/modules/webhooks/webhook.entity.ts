import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Entity('webhooks')
@Index(['userId'])
@Index(['isActive'])
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'simple-array' })
  events: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  secret: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  deliveryCount: number;

  @Column({ type: 'integer', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastDeliveredAt: Date;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
