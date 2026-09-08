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
import { Role } from './role.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  passwordHash: string;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @Column('enum', {
    enum: ['Active', 'Suspended', 'Released', 'Terminated', 'Deleted'],
    default: 'Active',
  })
  status: string;

  @Column({ nullable: true, type: 'timestamp' })
  lastLogin: Date;

  @OneToMany(() => RefreshToken, (token) => token.user, {
    cascade: true,
  })
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: number;
}
