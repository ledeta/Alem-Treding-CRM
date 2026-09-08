import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Item } from './entities/item.entity';
import { Stock } from './entities/stock.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  async create(createItemDto: CreateItemDto) {
    const { name, sku, description, category, purchasePrice, sellingPrice } =
      createItemDto;

    // Check if SKU already exists if provided
    if (sku) {
      const existingSku = await this.itemRepository.findOne({
        where: { sku },
      });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Validate prices
    if (purchasePrice < 0 || sellingPrice < 0) {
      throw new BadRequestException('Prices cannot be negative');
    }

    // Create item
    const item = this.itemRepository.create({
      name,
      sku,
      description,
      category,
      purchasePrice,
      sellingPrice,
      isActive: true,
    });

    // Create associated stock record
    const stock = this.stockRepository.create({
      quantity: 0,
      lowStockThreshold: 10,
      item,
    });

    await this.stockRepository.save(stock);
    item.stock = stock;

    const savedItem = await this.itemRepository.save(item);
    this.logger.log(`Item created: ${name}`);

    return this.findById(savedItem.id);
  }

  async findById(id: number) {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['stock'],
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async findAll(page: number = 1, limit: number = 10, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const whereCondition = isActive !== undefined ? { isActive } : {};

    const [items, total] = await this.itemRepository.findAndCount({
      where: whereCondition,
      relations: ['stock'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async searchByName(name: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.itemRepository.findAndCount({
      where: { name: ILike(`%${name}%`) },
      relations: ['stock'],
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data: items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async searchBySku(sku: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.itemRepository.findAndCount({
      where: { sku: ILike(`%${sku}%`) },
      relations: ['stock'],
      skip,
      take: limit,
      order: { sku: 'ASC' },
    });

    return {
      data: items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async searchByCategory(
    category: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.itemRepository.findAndCount({
      where: { category: ILike(`%${category}%`) },
      relations: ['stock'],
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data: items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    const item = await this.findById(id);

    // Check if SKU is being updated and if it's unique
    if (updateItemDto.sku && updateItemDto.sku !== item.sku) {
      const existingSku = await this.itemRepository.findOne({
        where: { sku: updateItemDto.sku },
      });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Validate prices if provided
    if (updateItemDto.purchasePrice !== undefined && updateItemDto.purchasePrice < 0) {
      throw new BadRequestException('Purchase price cannot be negative');
    }

    if (updateItemDto.sellingPrice !== undefined && updateItemDto.sellingPrice < 0) {
      throw new BadRequestException('Selling price cannot be negative');
    }

    Object.assign(item, updateItemDto);
    const updatedItem = await this.itemRepository.save(item);

    this.logger.log(`Item updated: ${item.name}`);
    return this.findById(updatedItem.id);
  }

  async delete(id: number) {
    const item = await this.findById(id);

    // Soft delete
    item.isActive = false;
    const deletedItem = await this.itemRepository.save(item);

    this.logger.log(`Item deleted: ${item.name}`);
    return deletedItem;
  }

  async updateStock(
    itemId: number,
    quantity: number,
  ) {
    const item = await this.findById(itemId);

    if (quantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    const stock = item.stock;
    stock.quantity = quantity;

    const updatedStock = await this.stockRepository.save(stock);
    this.logger.log(`Stock updated for item: ${item.name}`);

    return updatedStock;
  }

  async getStock(itemId: number) {
    const item = await this.findById(itemId);
    return item.stock;
  }

  async decreaseStock(itemId: number, quantity: number) {
    const item = await this.findById(itemId);
    const stock = item.stock;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (stock.quantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    stock.quantity -= quantity;
    const updatedStock = await this.stockRepository.save(stock);

    this.logger.log(`Stock decreased for item: ${item.name}`);
    return updatedStock;
  }

  async increaseStock(itemId: number, quantity: number) {
    const item = await this.findById(itemId);
    const stock = item.stock;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    stock.quantity += quantity;
    const updatedStock = await this.stockRepository.save(stock);

    this.logger.log(`Stock increased for item: ${item.name}`);
    return updatedStock;
  }

  async getLowStockItems(threshold: number = 10) {
    const items = await this.itemRepository.find({
      where: { isActive: true },
      relations: ['stock'],
    });

    return items.filter((item) => item.stock.quantity <= threshold);
  }

  async getOutOfStockItems() {
    const items = await this.itemRepository.find({
      where: { isActive: true },
      relations: ['stock'],
    });

    return items.filter((item) => item.stock.quantity === 0);
  }

  async searchItems(
    query: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.itemRepository.findAndCount({
      where: [
        { name: ILike(`%${query}%`) },
        { sku: ILike(`%${query}%`) },
        { category: ILike(`%${query}%`) },
      ],
      relations: ['stock'],
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data: items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getCategories() {
    const items = await this.itemRepository.find({
      where: { isActive: true },
    });

    const categories = [...new Set(items.map((item) => item.category))].filter(
      (cat) => cat !== null && cat !== undefined,
    );

    return categories;
  }
}
