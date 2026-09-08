import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Entity('api_keys')
@Index(['token'], { unique: true })
@Index(['userId'])
@Index(['isActive'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  token: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'simple-array', default: 'read,write' })
  scopes: string[];

  @Column({ type: 'simple-array', nullable: true })
  allowedIPs: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastUsedIP: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
