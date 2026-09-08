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
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Items')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  private readonly logger = new Logger(ItemsController.name);

  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new item' })
  async create(@Body() createItemDto: CreateItemDto) {
    this.logger.log('Creating new item');
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all items with pagination' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.itemsService.findAll(page, limit, isActive);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search items by name, SKU, or category' })
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!query) {
      throw new Error('Query parameter is required');
    }
    return this.itemsService.searchItems(query, page, limit);
  }

  @Get('search-by-name')
  @ApiOperation({ summary: 'Search items by name' })
  async searchByName(
    @Query('name') name: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!name) {
      throw new Error('Name parameter is required');
    }
    return this.itemsService.searchByName(name, page, limit);
  }

  @Get('search-by-sku')
  @ApiOperation({ summary: 'Search items by SKU' })
  async searchBySku(
    @Query('sku') sku: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!sku) {
      throw new Error('SKU parameter is required');
    }
    return this.itemsService.searchBySku(sku, page, limit);
  }

  @Get('search-by-category')
  @ApiOperation({ summary: 'Search items by category' })
  async searchByCategory(
    @Query('category') category: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!category) {
      throw new Error('Category parameter is required');
    }
    return this.itemsService.searchByCategory(category, page, limit);
  }

  @Get('stock/low')
  @ApiOperation({ summary: 'Get low stock items' })
  async getLowStockItems(@Query('threshold') threshold: number = 10) {
    return this.itemsService.getLowStockItems(threshold);
  }

  @Get('stock/out-of-stock')
  @ApiOperation({ summary: 'Get out of stock items' })
  async getOutOfStockItems() {
    return this.itemsService.getOutOfStockItems();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all item categories' })
  async getCategories() {
    return this.itemsService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  async findById(@Param('id') id: number) {
    return this.itemsService.findById(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Get stock information for an item' })
  async getStock(@Param('id') id: number) {
    return this.itemsService.getStock(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an item' })
  async update(@Param('id') id: number, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Post(':id/stock/increase')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Increase item stock' })
  async increaseStock(
    @Param('id') id: number,
    @Body() body: { quantity: number },
  ) {
    return this.itemsService.increaseStock(id, body.quantity);
  }

  @Post(':id/stock/decrease')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Decrease item stock' })
  async decreaseStock(
    @Param('id') id: number,
    @Body() body: { quantity: number },
  ) {
    return this.itemsService.decreaseStock(id, body.quantity);
  }

  @Post(':id/stock/update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update item stock manually' })
  async updateStock(
    @Param('id') id: number,
    @Body() body: { quantity: number },
  ) {
    return this.itemsService.updateStock(
      id,
      body.quantity,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete (soft delete) an item' })
  async delete(@Param('id') id: number) {
    return this.itemsService.delete(id);
  }
}
