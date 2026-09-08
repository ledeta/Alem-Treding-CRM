import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRefundDto {
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
  @IsString()
  notes?: string;
}

export class ApproveRefundDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  approvedBy: number;

  @ApiProperty({ example: true })
  @IsOptional()
  updateInventory?: boolean;
}

export class RejectRefundDto {
  @ApiProperty()
  @IsString()
  notes: string;

  @ApiProperty()
  approvedBy: number;
}

export class CompleteRefundDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
