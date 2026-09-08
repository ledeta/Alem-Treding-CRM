import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { User } from '../../auth/entities/user.entity'

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  fileName: string

  @Column()
  filePath: string

  @Column()
  fileSize: number

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed'] })
  status: 'pending' | 'processing' | 'completed' | 'failed'

  @Column({ type: 'enum', enum: ['customer', 'item', 'transaction', 'mixed', 'unknown'] })
  detectedType: 'customer' | 'item' | 'transaction' | 'mixed' | 'unknown'

  @Column({ type: 'int', default: 0 })
  totalRecords: number

  @Column({ type: 'int', default: 0 })
  importedRecords: number

  @Column({ type: 'int', default: 0 })
  failedRecords: number

  @Column({ type: 'json', nullable: true })
  errors: string[]

  @ManyToOne(() => User)
  uploadedBy: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
