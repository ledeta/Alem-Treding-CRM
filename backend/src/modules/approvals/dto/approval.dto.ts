import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ApprovalType {
  PAYMENT = 'payment',
  CREDIT = 'credit',
  REFUND = 'refund',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class CreateApprovalDto {
  @ApiProperty({ enum: ApprovalType })
  @IsEnum(ApprovalType)
  @IsNotEmpty()
  type: ApprovalType;

  @ApiProperty({ example: 1, description: 'Related payment/credit/refund ID' })
  @IsNumber()
  @IsNotEmpty()
  relatedId: number;

  @ApiProperty({ example: 1, description: 'Customer ID' })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ example: 5000, description: 'Amount' })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ required: false, description: 'Reason for approval' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false, description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 1, description: 'User requesting approval' })
  @IsNumber()
  @IsNotEmpty()
  requestedBy: number;
}

export class ApproveApprovalDto {
  @ApiProperty({ description: 'Approval decision' })
  @IsEnum(['approved', 'rejected'])
  @IsNotEmpty()
  decision: 'approved' | 'rejected';

  @ApiProperty({ required: false, description: 'Reason for decision' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: 1, description: 'User approving' })
  @IsNumber()
  @IsNotEmpty()
  approvedBy: number;
}

export class ApprovalResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: ApprovalType })
  type: ApprovalType;

  @ApiProperty({ enum: ApprovalStatus })
  status: ApprovalStatus;

  @ApiProperty()
  relatedId: number;

  @ApiProperty()
  customerId: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  requestedBy: number;

  @ApiProperty()
  approvedBy: number;

  @ApiProperty()
  approvalDate: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ApprovalListQueryDto {
  @ApiProperty({ enum: ApprovalStatus, required: false })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @ApiProperty({ enum: ApprovalType, required: false })
  @IsOptional()
  @IsEnum(ApprovalType)
  type?: ApprovalType;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number;
}

export class ApprovalStatsDto {
  @ApiProperty({ description: 'Total pending approvals' })
  pendingCount: number;

  @ApiProperty({ description: 'Total approved approvals' })
  approvedCount: number;

  @ApiProperty({ description: 'Total rejected approvals' })
  rejectedCount: number;

  @ApiProperty({ description: 'Breakdown by type' })
  byType: Record<ApprovalType, number>;

  @ApiProperty({ description: 'Average approval time in hours' })
  averageApprovalTime: number;
}
