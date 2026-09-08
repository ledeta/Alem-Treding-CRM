import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('chat_messages')
@Index(['conversationId'])
@Index(['senderId'])
@Index(['createdAt'])
@Index(['messageType'])
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversationId: string; // UUID for conversation

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'text' }) // text, file, system
  messageType: string;

  @Column({ nullable: true, type: 'json' })
  metadata: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ nullable: true })
  editedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
