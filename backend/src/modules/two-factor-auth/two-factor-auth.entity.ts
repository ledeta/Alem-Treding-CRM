import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Entity('two_factor_auth')
export class TwoFactorAuth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  secret: string;

  @Column({ type: 'text', nullable: true })
  backupCodes: string;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'varchar', length: 20, default: 'totp' })
  method: 'totp' | 'sms' | 'email';

  @Column({ type: 'varchar', length: 255, nullable: true })
  smsPhoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailAddress: string;

  @Column({ type: 'timestamp', nullable: true })
  enabledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'integer', default: 0 })
  failedAttempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
