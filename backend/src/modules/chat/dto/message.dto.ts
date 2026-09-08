import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;

  @ApiProperty({ enum: ['text', 'file', 'system'], default: 'text', required: false })
  @IsOptional()
  @IsEnum(['text', 'file', 'system'])
  messageType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MessageResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  conversationId: string;

  @ApiProperty()
  sender: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty()
  message: string;

  @ApiProperty()
  messageType: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  editedAt: Date;

  @ApiProperty()
  metadata?: Record<string, any>;
}

export class EditMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;
}

export class ConversationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  participants: any[];

  @ApiProperty()
  lastMessage: MessageResponseDto;

  @ApiProperty()
  unreadCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedMessagesDto {
  @ApiProperty({ type: [MessageResponseDto] })
  data: MessageResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  pages: number;
}
