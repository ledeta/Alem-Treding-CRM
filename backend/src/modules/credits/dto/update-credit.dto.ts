import { IsString, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCreditDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveCreditDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  approvedAmount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  approvedBy: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class RejectCreditDto {
  @ApiProperty()
  @IsString()
  notes: string;

  @ApiProperty()
  approvedBy: number;
}

export class UseCreditDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}
