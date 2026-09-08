import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DataType {
  CUSTOMERS = 'customers',
  ITEMS = 'items',
  TRANSACTIONS = 'transactions',
}

export class UploadDto {
  @ApiProperty({ enum: DataType, description: 'Type of data being imported' })
  @IsEnum(DataType)
  @IsNotEmpty()
  dataType: DataType;

  @ApiProperty({ required: false, description: 'Optional column mapping' })
  @IsOptional()
  @IsObject()
  columnMapping?: Record<string, string>;

  @ApiProperty({
    required: false,
    description: 'Whether to skip duplicates',
    default: true,
  })
  @IsOptional()
  skipDuplicates?: boolean;
}

export class ColumnDetectionDto {
  @ApiProperty({ description: 'Auto-detected column names' })
  @IsString({ each: true })
  detectedColumns: string[];

  @ApiProperty({
    description: 'Suggested mapping based on content analysis',
  })
  @IsObject()
  suggestedMapping: Record<string, string>;

  @ApiProperty({ description: 'Preview of first few rows' })
  previewRows: any[];

  @ApiProperty({ description: 'Total rows in file' })
  @IsNumber()
  totalRows: number;
}

export class ImportValidationDto {
  @ApiProperty({
    description: 'Number of valid records ready to import',
  })
  @IsNumber()
  @Min(0)
  validRecords: number;

  @ApiProperty({
    description: 'Number of invalid records with errors',
  })
  @IsNumber()
  @Min(0)
  invalidRecords: number;

  @ApiProperty({
    description: 'List of validation errors with row numbers',
  })
  errors: Array<{
    row: number;
    field: string;
    error: string;
    value: any;
  }>;

  @ApiProperty({
    description: 'Array of duplicate detection info',
  })
  duplicates: Array<{
    row: number;
    matchedOn: string;
    matchedValue: any;
    existingId: number;
  }>;
}

export class ImportProgressDto {
  @ApiProperty({ description: 'Import job ID for tracking' })
  @IsString()
  jobId: string;

  @ApiProperty({ description: 'Current processing status' })
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status: string;

  @ApiProperty({ description: 'Total records to process' })
  @IsNumber()
  totalRecords: number;

  @ApiProperty({ description: 'Processed records count' })
  @IsNumber()
  processedRecords: number;

  @ApiProperty({ description: 'Progress percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: 'Estimated time remaining in seconds',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  estimatedTimeRemaining?: number;

  @ApiProperty({ description: 'Error message if failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class ImportResultDto {
  @ApiProperty({ description: 'Total records imported' })
  @IsNumber()
  successCount: number;

  @ApiProperty({ description: 'Records that failed import' })
  @IsNumber()
  failureCount: number;

  @ApiProperty({ description: 'Records skipped as duplicates' })
  @IsNumber()
  skippedCount: number;

  @ApiProperty({ description: 'Detailed error log' })
  @IsOptional()
  @IsString()
  errorLog?: string;

  @ApiProperty({ description: 'List of newly created record IDs' })
  createdIds: number[];

  @ApiProperty({ description: 'Timestamp of import completion' })
  completedAt: Date;
}
