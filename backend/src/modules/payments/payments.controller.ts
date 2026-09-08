import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, ApprovePaymentDto, RejectPaymentDto } from './dto/update-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new payment request' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    this.logger.log('Creating new payment request');
    // Use system user (ID 1) if createdBy is not provided
    if (!createPaymentDto.createdBy) {
      createPaymentDto.createdBy = 1;
    }
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments with pagination' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentsService.findAll(page, limit);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get payments by status' })
  async findByStatus(
    @Param('status') status: 'Pending' | 'Approved' | 'Rejected',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentsService.findByStatus(status, page, limit);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get payments by customer' })
  async findByCustomer(
    @Param('customerId') customerId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentsService.findByCustomer(customerId, page, limit);
  }

  @Get('bank/:bank')
  @ApiOperation({ summary: 'Get payments by bank' })
  async findByBank(
    @Param('bank') bank: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentsService.findByBank(bank, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search payments' })
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!query) {
      throw new Error('Query parameter is required');
    }
    return this.paymentsService.search(query, page, limit);
  }

  @Get('statistics/pending-count')
  @ApiOperation({ summary: 'Get pending payments count' })
  async getPendingPaymentsCount() {
    const count = await this.paymentsService.getPendingPaymentsCount();
    return { count };
  }

  @Get('statistics/approved-count')
  @ApiOperation({ summary: 'Get approved payments count' })
  async getApprovedPaymentsCount() {
    const count = await this.paymentsService.getApprovedPaymentsCount();
    return { count };
  }

  @Get('statistics/rejected-count')
  @ApiOperation({ summary: 'Get rejected payments count' })
  async getRejectedPaymentsCount() {
    const count = await this.paymentsService.getRejectedPaymentsCount();
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findById(@Param('id') id: number) {
    return this.paymentsService.findById(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a payment request' })
  async approve(
    @Param('id') id: number,
    @Body() approvePaymentDto: ApprovePaymentDto,
  ) {
    return this.paymentsService.approve(id, approvePaymentDto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a payment request' })
  async reject(
    @Param('id') id: number,
    @Body() rejectPaymentDto: RejectPaymentDto,
  ) {
    return this.paymentsService.reject(id, rejectPaymentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payment request' })
  async update(
    @Param('id') id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment request' })
  async delete(@Param('id') id: number) {
    return this.paymentsService.delete(id);
  }

  @Get(':customerId/total-approved')
  @ApiOperation({ summary: 'Get total approved payments for a customer' })
  async getTotalApprovedPayments(@Param('customerId') customerId: number) {
    const total = await this.paymentsService.getTotalApprovedPayments(customerId);
    return { total };
  }
}
