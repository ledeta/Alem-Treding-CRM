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
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from './dto/user.dto';
import { RoleGuard } from '../../common/guards/role.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RoleGuard('Admin')
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    this.logger.log(`Admin ${req.user.username} creating user: ${createUserDto.username}`);
    return this.usersService.create(createUserDto, req.user.id);
  }

  @Get()
  @RoleGuard('Admin')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get('role/:roleId')
  @RoleGuard('Admin')
  @ApiOperation({ summary: 'Get users by role (Admin only)' })
  async findByRole(
    @Param('roleId') roleId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.findByRole(roleId, page, limit);
  }

  @Get('search')
  @RoleGuard('Admin')
  @ApiOperation({ summary: 'Search users (Admin only)' })
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.search(query, page, limit);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @RoleGuard('Admin')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async findById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @RoleGuard('Admin')
  @ApiOperation({ summary: 'Update user (Admin only)' })
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    this.logger.log(`Admin ${req.user.username} updating user: ${id}`);
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/status')
  @RoleGuard('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  async updateStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @Request() req,
  ) {
    this.logger.log(
      `Admin ${req.user.username} updating user ${id} status to: ${updateStatusDto.status}`,
    );
    return this.usersService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @RoleGuard('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  async delete(@Param('id') id: number, @Request() req) {
    this.logger.log(`Admin ${req.user.username} deleting user: ${id}`);
    return this.usersService.delete(id);
  }
}
