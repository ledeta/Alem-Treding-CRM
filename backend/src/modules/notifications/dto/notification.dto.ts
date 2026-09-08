import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  UPLOAD = 'upload',
  PAYMENT_REQUEST = 'payment_request',
  APPROVAL = 'approval',
  REFUND_REQUEST = 'refund_request',
  CREDIT_REQUEST = 'credit_request',
  SYSTEM = 'system',
}

export class CreateNotificationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({ example: 'File Upload Complete' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Your Excel import has been processed successfully' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  relatedId?: number;

  @ApiProperty({ required: false, example: 'upload' })
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;
}

export class NotificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  relatedId: number;

  @ApiProperty()
  relatedType: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  readAt: Date;

  @ApiProperty()
  actionUrl: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  createdAt: Date;
}

export class NotificationQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class NotificationStatsDto {
  @ApiProperty()
  totalNotifications: number;

  @ApiProperty()
  unreadCount: number;

  @ApiProperty()
  readCount: number;

  @ApiProperty()
  byType: Record<string, number>;
}
