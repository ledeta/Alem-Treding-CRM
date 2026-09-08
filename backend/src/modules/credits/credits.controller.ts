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
import { CreditsService } from './credits.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto, ApproveCreditDto, RejectCreditDto, UseCreditDto } from './dto/update-credit.dto';

@ApiTags('Credits')
@ApiBearerAuth()
@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  private readonly logger = new Logger(CreditsController.name);

  constructor(private readonly creditsService: CreditsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new credit request' })
  async create(@Body() createCreditDto: CreateCreditDto) {
    this.logger.log('Creating new credit request');
    return this.creditsService.create(createCreditDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credit requests with pagination' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.creditsService.findAll(page, limit);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get credits by status' })
  async findByStatus(
    @Param('status') status: 'Pending' | 'Approved' | 'Rejected',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.creditsService.findByStatus(status, page, limit);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get credits for a specific customer' })
  async findByCustomer(
    @Param('customerId') customerId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.creditsService.findByCustomer(customerId, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search credits' })
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!query) {
      throw new Error('Query parameter is required');
    }
    return this.creditsService.search(query, page, limit);
  }

  @Get('statistics/pending-count')
  @ApiOperation({ summary: 'Get pending credits count' })
  async getPendingCreditsCount() {
    const count = await this.creditsService.getPendingCreditsCount();
    return { count };
  }

  @Get('statistics/approved-count')
  @ApiOperation({ summary: 'Get approved credits count' })
  async getApprovedCreditsCount() {
    const count = await this.creditsService.getApprovedCreditsCount();
    return { count };
  }

  @Get('statistics/total-approved')
  @ApiOperation({ summary: 'Get total approved credits' })
  async getTotalApprovedCredits() {
    const total = await this.creditsService.getTotalApprovedCredits();
    return { total };
  }

  @Get('statistics/expiring')
  @ApiOperation({ summary: 'Get credits expiring soon' })
  async getExpiringCredits(@Query('days') days: number = 7) {
    return this.creditsService.getExpiringCredits(days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit request by ID' })
  async findById(@Param('id') id: number) {
    return this.creditsService.findById(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a credit request' })
  async approve(
    @Param('id') id: number,
    @Body() approveCreditDto: ApproveCreditDto,
  ) {
    return this.creditsService.approve(id, approveCreditDto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a credit request' })
  async reject(
    @Param('id') id: number,
    @Body() rejectCreditDto: RejectCreditDto,
  ) {
    return this.creditsService.reject(id, rejectCreditDto);
  }

  @Post(':id/use')
  @ApiOperation({ summary: 'Use an approved credit' })
  async useCredit(
    @Param('id') id: number,
    @Body() useCreditDto: UseCreditDto,
  ) {
    return this.creditsService.useCredit(id, useCreditDto);
  }

  @Post(':id/reset')
  @ApiOperation({ summary: 'Reset credit usage to 0' })
  async resetCredit(@Param('id') id: number) {
    return this.creditsService.resetCredit(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a credit request' })
  async update(
    @Param('id') id: number,
    @Body() updateCreditDto: UpdateCreditDto,
  ) {
    return this.creditsService.update(id, updateCreditDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a credit request' })
  async delete(@Param('id') id: number) {
    return this.creditsService.delete(id);
  }

  @Get(':customerId/available')
  @ApiOperation({ summary: 'Get available credit for a customer' })
  async getAvailableCredit(@Param('customerId') customerId: number) {
    return this.creditsService.getAvailableCredit(customerId);
  }
}
