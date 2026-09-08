import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ExcelService } from '../excel/excel.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly excelService: ExcelService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Record a new sales transaction' })
  async recordSale(@Body() createTransactionDto: CreateTransactionDto) {
    this.logger.log('Recording new transaction');
    return this.transactionsService.recordSale(createTransactionDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all transactions with pagination' })
  async findAll(
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.transactionsService.findAll(pageNum, limitNum);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search transactions' })
  async search(
    @Query('q') query: string,
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    if (!query) {
      throw new Error('Query parameter is required');
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.transactionsService.search(query, pageNum, limitNum);
  }

  @Get('by-customer/:customerId')
  @Public()
  @ApiOperation({ summary: 'Get transactions for a specific customer' })
  async findByCustomer(
    @Param('customerId') customerId: number,
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.transactionsService.findByCustomer(customerId, pageNum, limitNum);
  }

  @Get('by-item/:itemId')
  @Public()
  @ApiOperation({ summary: 'Get transactions for a specific item' })
  async findByItem(
    @Param('itemId') itemId: number,
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.transactionsService.findByItem(itemId, pageNum, limitNum);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get transactions by type' })
  async findByType(
    @Param('type') type: 'Sale' | 'Refund' | 'Credit' | 'Payment',
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.transactionsService.findByType(type, pageNum, limitNum);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get transactions by status' })
  async findByStatus(
    @Param('status') status: 'Pending' | 'Completed' | 'Cancelled',
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.transactionsService.findByStatus(status, pageNum, limitNum);
  }

  @Get('history/:customerId')
  @ApiOperation({ summary: 'Get transaction history for a customer' })
  async getTransactionHistory(
    @Param('customerId') customerId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.transactionsService.getTransactionHistory(
      customerId,
      start,
      end,
      pageNum,
      limitNum,
    );
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get transactions by date range' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.transactionsService.findByDateRange(start, end, pageNum, limitNum);
  }

  @Get('statistics/total-sales')
  @ApiOperation({ summary: 'Get total sales amount' })
  async getTotalSalesAmount(
    @Query('customerId') customerId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const total = await this.transactionsService.getTotalSalesAmount(
      customerId,
      start,
      end,
    );
    return { total };
  }

  @Get('statistics/total-refunds')
  @ApiOperation({ summary: 'Get total refund amount' })
  async getTotalRefundAmount(
    @Query('customerId') customerId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const total = await this.transactionsService.getTotalRefundAmount(
      customerId,
      start,
      end,
    );
    return { total };
  }

  @Get('statistics/count')
  @ApiOperation({ summary: 'Get transaction count' })
  async getTransactionCount(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const count = await this.transactionsService.getTransactionCount(type, status);
    return { count };
  }

  @Get('statistics/daily-report')
  @ApiOperation({ summary: 'Get daily report' })
  async getDailyReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.transactionsService.getDailyReport(start, end);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get transaction by ID' })
  async findById(@Param('id') id: number) {
    return this.transactionsService.findById(id);
  }

  @Get('by-txn-id/:transactionId')
  @ApiOperation({ summary: 'Get transaction by Transaction ID' })
  async findByTransactionId(@Param('transactionId') transactionId: string) {
    return this.transactionsService.findByTransactionId(transactionId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update transaction status' })
  async updateStatus(
    @Param('id') id: number,
    @Body() body: { status: 'Pending' | 'Completed' | 'Cancelled' },
  ) {
    return this.transactionsService.updateStatus(id, body.status);
  }

  @Post('import/sales')
  @Public() // Skip JWT authentication for this endpoint
  @UseInterceptors(FileInterceptor('file', {
    storage: require('multer').memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('sheet') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only Excel files are allowed'), false);
      }
    },
  }))
  @ApiOperation({ summary: 'Bulk import sales transactions from Excel' })
  async bulkImportSales(
    @UploadedFile() file: any,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`🚀 ULTRA AGGRESSIVE: Upload received for file: ${file?.originalname}`);
    
    // ULTRA AGGRESSIVE: Use default user if not authenticated
    const finalUser = user || { id: 1, username: 'system' };
    this.logger.log(`User: ${finalUser.username}`);
    
    if (!file) {
      this.logger.error('❌ No file provided');
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (
      !file.mimetype.includes('spreadsheet') &&
      !file.mimetype.includes('sheet') &&
      !file.originalname.endsWith('.xlsx') &&
      !file.originalname.endsWith('.xls')
    ) {
      throw new BadRequestException('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
    }

    this.logger.log(`Processing Excel import from file: ${file.originalname}`);

    let tempFilePath: string;
    try {
      // For memory storage, we need to write the file to disk first
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      tempFilePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
      fs.writeFileSync(tempFilePath, file.buffer);
      this.logger.log(`✅ Temporary file written to: ${tempFilePath}`);
      
      // Parse Excel file
      const { rows, errors: parseErrors } = await this.excelService.parseSalesImportExcel(tempFilePath);
      this.logger.log(`📊 Parsed ${rows.length} valid rows, ${parseErrors.length} errors`);

      if (rows.length === 0) {
        throw new BadRequestException(
          `No valid rows found in Excel file. ${parseErrors.length > 0 ? `Parse errors: ${parseErrors.map((e) => e.error).join('; ')}` : ''}`,
        );
      }

      // Bulk import transactions
      const importResult = await this.transactionsService.bulkImportSalesTransactions(rows, finalUser.id);
      this.logger.log(`✅ Import completed: ${importResult.successCount} success, ${importResult.failCount} failed`);

      // Clean up uploaded file
      await this.excelService.deleteFile(tempFilePath);

      return {
        success: true,
        message: `Successfully imported ${importResult.successCount} transactions`,
        data: {
          totalRows: rows.length,
          successCount: importResult.successCount,
          failCount: importResult.failCount,
          parseErrors: parseErrors.slice(0, 10),
          importErrors: importResult.errors.slice(0, 10),
          categorySummary: importResult.categorySummary,
          branchSummary: importResult.branchSummary,
          salesPersonSummary: importResult.salesPersonSummary,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      // Clean up file on error
      try {
        await this.excelService.deleteFile(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }

      this.logger.error(`❌ Excel import error: ${error}`);
      throw error;
    }
  }
}
