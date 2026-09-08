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

const BANK_OPTIONS = [
  'Telebirr',
  'CBE',
  'Dashen Bank',
  'Awash Bank',
  'Abyssinia Bank',
  'Wegagen Bank',
  'Siinqee Bank',
  'Other',
];

export class CreatePaymentRequestDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  customerId: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Telebirr', enum: BANK_OPTIONS })
  @IsEnum(BANK_OPTIONS)
  bank: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  requestDate: string;

  @ApiProperty({ example: '10:30', required: false })
  @IsOptional()
  @IsString()
  requestTime?: string;
}

export class ApprovePaymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectPaymentDto {
  @ApiProperty()
  @IsString()
  notes: string;
}

export class PaymentRequestResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  customerId: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  bank: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  requestDate: Date;

  @ApiProperty()
  createdAt: Date;
}
