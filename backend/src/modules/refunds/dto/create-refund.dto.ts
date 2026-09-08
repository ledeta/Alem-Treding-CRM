import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundDto {
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

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 70000 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  refundAmount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;
}
