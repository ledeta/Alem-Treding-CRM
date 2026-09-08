import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, ILike } from 'typeorm'
import { Customer } from '../customers/entities/customer.entity'
import { Item } from '../items/entities/item.entity'
import { SalesTransaction } from '../transactions/entities/sales-transaction.entity'

interface SearchResult {
  customers: Customer[]
  items: Item[]
  transactions: SalesTransaction[]
  total: number
}

interface SearchOptions {
  query: string
  limit?: number
  offset?: number
  type?: 'customer' | 'item' | 'transaction' | 'all'
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    @InjectRepository(SalesTransaction)
    private transactionsRepository: Repository<SalesTransaction>,
  ) {}

  async search(options: SearchOptions): Promise<SearchResult> {
    const { query, limit = 20, offset = 0, type = 'all' } = options

    const searchPattern = `%${query}%`
    const results: SearchResult = {
      customers: [],
      items: [],
      transactions: [],
      total: 0,
    }

    if (type === 'customer' || type === 'all') {
      results.customers = await this.searchCustomers(query, limit, offset)
    }

    if (type === 'item' || type === 'all') {
      results.items = await this.searchItems(query, limit, offset)
    }

    if (type === 'transaction' || type === 'all') {
      results.transactions = await this.searchTransactions(query, limit, offset)
    }

    results.total =
      results.customers.length + results.items.length + results.transactions.length

    return results
  }

  private async searchCustomers(
    query: string,
    limit: number,
    offset: number
  ): Promise<Customer[]> {
    return this.customersRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { phone: Like(`%${query}%`) },
        { address: ILike(`%${query}%`) },
      ],
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    })
  }

  private async searchItems(
    query: string,
    limit: number,
    offset: number
  ): Promise<Item[]> {
    return this.itemsRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { sku: Like(`%${query}%`) },
        { category: ILike(`%${query}%`) },
      ],
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    })
  }

  private async searchTransactions(
    query: string,
    limit: number,
    offset: number
  ): Promise<SalesTransaction[]> {
    return this.transactionsRepository.find({
      where: [
        { customer: { name: ILike(`%${query}%`) } },
        { item: { name: ILike(`%${query}%`) } },
      ] as any,
      relations: ['customer', 'item'],
      take: limit,
      skip: offset,
      order: { transactionDate: 'DESC' },
    })
  }

  async getRecentSearches(userId: string, limit = 10): Promise<string[]> {
    // Implementation for storing and retrieving search history
    // This would typically be stored in Redis or a separate table
    return []
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const customers = await this.customersRepository
      .createQueryBuilder('customer')
      .select('customer.name')
      .where('customer.name ILIKE :query', { query: `${query}%` })
      .take(5)
      .getMany()

    const items = await this.itemsRepository
      .createQueryBuilder('item')
      .select('item.name')
      .where('item.name ILIKE :query', { query: `${query}%` })
      .take(5)
      .getMany()

    const suggestions = [
      ...customers.map((c) => c.name),
      ...items.map((i) => i.name),
    ]

    return [...new Set(suggestions)].slice(0, 10)
  }
}
