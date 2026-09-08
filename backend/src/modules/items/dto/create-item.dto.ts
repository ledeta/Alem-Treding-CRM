import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ example: 'Laptop' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'LT-001', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 'High-performance laptop', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Electronics', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  purchasePrice: number;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  sellingPrice: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
