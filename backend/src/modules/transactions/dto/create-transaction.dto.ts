import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  customerId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  itemId: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  unitPrice: number;

  @ApiProperty({ example: 'Sale', enum: ['Sale', 'Refund', 'Credit', 'Payment'] })
  @IsEnum(['Sale', 'Refund', 'Credit', 'Payment'])
  @IsNotEmpty()
  transactionType: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  transactionDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  referenceId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceType?: string;
}
