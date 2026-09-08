import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../auth/entities/user.entity'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: ['upload', 'payment', 'credit', 'refund', 'approval', 'system'],
  })
  type: 'upload' | 'payment' | 'credit' | 'refund' | 'approval' | 'system'

  @Column()
  title: string

  @Column()
  message: string

  @Column({ nullable: true })
  relatedId: string

  @Column({ default: false })
  read: boolean

  @Column({ nullable: true })
  readAt: Date

  @Column()
  recipientId: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipientId' })
  recipient: User

  @CreateDateColumn()
  createdAt: Date
}
