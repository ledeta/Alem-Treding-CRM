import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  @Roles('admin')
  @ApiOperation({ summary: 'Get audit logs (admin only)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0,
  ) {
    return this.auditService.getLogs({
      userId,
      action,
      status,
      startDate,
      endDate,
      limit,
      offset,
    });
  }

  @Get('failed-attempts')
  @Roles('admin')
  @ApiOperation({ summary: 'Get failed login attempts (admin only)' })
  @ApiQuery({ name: 'hours', required: false, type: Number })
  async getFailedAttempts(@Query('hours') hours: number = 24) {
    return this.auditService.getFailedAttempts(hours);
  }

  @Get('statistics')
  @Roles('admin')
  @ApiOperation({ summary: 'Get audit statistics (admin only)' })
  async getStatistics() {
    return this.auditService.getStatistics();
  }
}
