import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApprovePaymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  approvedBy: number;
}

export class RejectPaymentDto {
  @ApiProperty()
  @IsString()
  notes: string;

  @ApiProperty()
  approvedBy: number;
}
