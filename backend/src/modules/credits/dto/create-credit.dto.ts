import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCreditDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  requestedAmount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;
}
