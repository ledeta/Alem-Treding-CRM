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
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto, ApproveRefundDto, RejectRefundDto, CompleteRefundDto } from './dto/update-refund.dto';

@ApiTags('Refunds')
@ApiBearerAuth()
@Controller('refunds')
@UseGuards(JwtAuthGuard)
export class RefundsController {
  private readonly logger = new Logger(RefundsController.name);

  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new refund request' })
  async create(@Body() createRefundDto: CreateRefundDto) {
    this.logger.log('Creating new refund request');
    return this.refundsService.create(createRefundDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all refund requests with pagination' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.refundsService.findAll(page, limit);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get refunds by status' })
  async findByStatus(
    @Param('status') status: 'Pending' | 'Approved' | 'Rejected' | 'Completed',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.refundsService.findByStatus(status, page, limit);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get refunds for a specific customer' })
  async findByCustomer(
    @Param('customerId') customerId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.refundsService.findByCustomer(customerId, page, limit);
  }

  @Get('item/:itemId')
  @ApiOperation({ summary: 'Get refunds for a specific item' })
  async findByItem(
    @Param('itemId') itemId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.refundsService.findByItem(itemId, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search refunds' })
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!query) {
      throw new Error('Query parameter is required');
    }
    return this.refundsService.search(query, page, limit);
  }

  @Get('statistics/pending-count')
  @ApiOperation({ summary: 'Get pending refunds count' })
  async getPendingRefundsCount() {
    const count = await this.refundsService.getPendingRefundsCount();
    return { count };
  }

  @Get('statistics/approved-count')
  @ApiOperation({ summary: 'Get approved refunds count' })
  async getApprovedRefundsCount() {
    const count = await this.refundsService.getApprovedRefundsCount();
    return { count };
  }

  @Get('statistics/completed-count')
  @ApiOperation({ summary: 'Get completed refunds count' })
  async getCompletedRefundsCount() {
    const count = await this.refundsService.getCompletedRefundsCount();
    return { count };
  }

  @Get('statistics/total-amount')
  @ApiOperation({ summary: 'Get total refund amount' })
  async getTotalRefundAmount(@Query('customerId') customerId?: number) {
    const total = await this.refundsService.getTotalRefundAmount(customerId);
    return { total };
  }

  @Get('statistics/pending-inventory-update')
  @ApiOperation({ summary: 'Get refunds pending inventory update' })
  async getRefundsNotUpdatingInventory() {
    return this.refundsService.getRefundsNotUpdatingInventory();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get refund request by ID' })
  async findById(@Param('id') id: number) {
    return this.refundsService.findById(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a refund request' })
  async approve(
    @Param('id') id: number,
    @Body() approveRefundDto: ApproveRefundDto,
  ) {
    return this.refundsService.approve(id, approveRefundDto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a refund request' })
  async reject(
    @Param('id') id: number,
    @Body() rejectRefundDto: RejectRefundDto,
  ) {
    return this.refundsService.reject(id, rejectRefundDto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete an approved refund' })
  async complete(
    @Param('id') id: number,
    @Body() completeRefundDto: CompleteRefundDto,
  ) {
    return this.refundsService.complete(id, completeRefundDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a refund request' })
  async update(
    @Param('id') id: number,
    @Body() updateRefundDto: UpdateRefundDto,
  ) {
    return this.refundsService.update(id, updateRefundDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a refund request' })
  async delete(@Param('id') id: number) {
    return this.refundsService.delete(id);
  }
}
