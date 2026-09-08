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

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Telebirr', enum: BANK_OPTIONS })
  @IsEnum(BANK_OPTIONS)
  @IsNotEmpty()
  bank: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  requestDate: string;

  @ApiProperty({ example: '10:30', required: false })
  @IsOptional()
  @IsString()
  requestTime?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  createdBy?: number;
}
