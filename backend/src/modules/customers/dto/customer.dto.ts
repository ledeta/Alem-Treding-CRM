import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'C001', required: false })
  @IsOptional()
  @IsString()
  customerIdRef?: string;

  @ApiProperty({ example: '+251911234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class CustomerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  customerIdRef: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  creditAmount: number;

  @ApiProperty()
  refundAmount: number;

  @ApiProperty()
  lastTransactionDate: Date;

  @ApiProperty()
  createdAt: Date;
}

export class CustomerSearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerIdRef?: string;
}
