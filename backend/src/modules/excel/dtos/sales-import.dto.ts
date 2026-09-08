import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkSalesImportDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Excel file containing sales data',
  })
  @IsNotEmpty()
  file: any; // Multer file type

  @ApiProperty({ required: false, default: 'Sheet1' })
  @IsOptional()
  @IsString()
  sheetName?: string;
}

export class SalesImportRowDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'Rice' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  sellingPrice: number;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  @IsNotEmpty()
  soldBy: string;

  @ApiProperty({ example: 'Warehouse', enum: ['Warehouse', 'Shop'] })
  @IsEnum(['Warehouse', 'Shop'])
  @IsNotEmpty()
  branch: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsNotEmpty()
  date: string | Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SalesImportResultDto {
  @ApiProperty({ example: 100 })
  totalRows: number;

  @ApiProperty({ example: 98 })
  successfulRows: number;

  @ApiProperty({ example: 2 })
  failedRows: number;

  @ApiProperty({ example: [], description: 'List of errors from failed rows' })
  errors: {
    rowNumber: number;
    error: string;
    data?: any;
  }[];

  @ApiProperty({ example: 'Rice', description: 'Detected category from items' })
  detectedCategory?: string;

  @ApiProperty({
    example: { Rice: 50, Wheat: 30 },
    description: 'Summary by category',
  })
  categorySummary: Record<string, number>;

  @ApiProperty({
    example: { Warehouse: 45, Shop: 25 },
    description: 'Summary by branch',
  })
  branchSummary: Record<string, number>;

  @ApiProperty({
    example: { John: 30, Ahmed: 40 },
    description: 'Summary by salesperson',
  })
  salesPersonSummary: Record<string, number>;

  @ApiProperty({ example: new Date().toISOString() })
  importedAt: string;
}
