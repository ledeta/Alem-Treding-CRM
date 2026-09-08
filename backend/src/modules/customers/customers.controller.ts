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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerSearchDto } from './dto/customer.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../common/guards/role.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    this.logger.log(`Creating customer: ${createCustomerDto.name}`);
    return this.customersService.create(createCustomerDto);
  }

  @Post('bulk-create')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create customers from array' })
  async bulkCreate(@Body() body: { customers: Array<{ name: string }> }) {
    this.logger.log(`Bulk creating ${body.customers.length} customers`);
    return this.customersService.bulkCreate(body.customers);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all active customers' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    this.logger.log(`Fetching customers - page: ${pageNum}, limit: ${limitNum}`);
    return this.customersService.findAll(pageNum, limitNum);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search customers by name, phone, or ID' })
  async search(
    @Query('q') query: string,
    @Query('field') field: 'name' | 'phone' | 'customerIdRef' = 'name',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    this.logger.log(`Searching customers - query: ${query}, field: ${field}, page: ${pageNum}, limit: ${limitNum}`);
    return this.customersService.search(query, field, pageNum, limitNum);
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Get customers with no transaction in specified days' })
  async getInactiveCustomers(
    @Query('days') days: number = 15,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    this.logger.log(`Fetching inactive customers - days: ${days}`);
    return this.customersService.getNoVisitCustomers(days, page, limit);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get detailed customer profile' })
  async getProfile(@Param('id') id: number) {
    this.logger.log(`Fetching customer profile - id: ${id}`);
    return this.customersService.getCustomerProfile(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(@Param('id') id: number) {
    this.logger.log(`Fetching customer - id: ${id}`);
    return this.customersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer details' })
  async update(
    @Param('id') id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    this.logger.log(`Updating customer - id: ${id}`);
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a customer' })
  async deactivate(@Param('id') id: number) {
    this.logger.log(`Deactivating customer - id: ${id}`);
    return this.customersService.deactivate(id);
  }

  @Get('stats/active-count')
  @ApiOperation({ summary: 'Get count of active customers' })
  async getActiveCount() {
    this.logger.log(`Fetching active customer count`);
    const count = await this.customersService.countActiveCustomers();
    return { count };
  }
}
