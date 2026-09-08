import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../common/guards/role.guard';
import { ApprovalsService } from './approvals.service';
import {
  CreateApprovalDto,
  ApproveApprovalDto,
  ApprovalListQueryDto,
} from './dto/approval.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Approvals')
@ApiBearerAuth()
@Controller('approvals')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class ApprovalsController {
  private readonly logger = new Logger(ApprovalsController.name);

  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create approval request' })
  async create(@Body() createApprovalDto: CreateApprovalDto) {
    this.logger.log(
      `Creating approval request: ${createApprovalDto.type} for customer ${createApprovalDto.customerId}`,
    );
    return this.approvalsService.create(createApprovalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all approvals with filters' })
  async findAll(@Query() query: ApprovalListQueryDto) {
    this.logger.log(`Fetching approvals - status: ${query.status}, type: ${query.type}`);
    return this.approvalsService.findAll(query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending approvals' })
  async getPending() {
    this.logger.log(`Fetching pending approvals`);
    return this.approvalsService.getPendingApprovals();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get approval statistics' })
  async getStatistics() {
    this.logger.log(`Fetching approval statistics`);
    return this.approvalsService.getStatistics();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get approvals for a customer' })
  async getCustomerApprovals(@Param('customerId') customerId: number) {
    this.logger.log(`Fetching approvals for customer: ${customerId}`);
    return this.approvalsService.getCustomerApprovals(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval by ID' })
  async findOne(@Param('id') id: number) {
    this.logger.log(`Fetching approval: ${id}`);
    return this.approvalsService.findById(id);
  }

  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject an approval request' })
  async processApproval(
    @Param('id') id: number,
    @Body() approveDto: ApproveApprovalDto,
  ) {
    this.logger.log(`Processing approval: ${id} - decision: ${approveDto.decision}`);
    return this.approvalsService.processApproval(id, approveDto);
  }

  @Post('bulk/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk approve multiple approvals' })
  async bulkApprove(
    @Body() body: { approvalIds: number[] },
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Bulk approving ${body.approvalIds.length} approvals`);
    return this.approvalsService.bulkApprove(body.approvalIds, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an approval request' })
  async cancel(
    @Param('id') id: number,
    @Query('reason') reason?: string,
  ) {
    this.logger.log(`Cancelling approval: ${id}`);
    return this.approvalsService.cancel(id, reason);
  }

  @Put(':id/notes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update approval notes' })
  async updateNotes(
    @Param('id') id: number,
    @Body() body: { notes: string },
  ) {
    this.logger.log(`Updating notes for approval: ${id}`);
    return this.approvalsService.updateNotes(id, body.notes);
  }
}
