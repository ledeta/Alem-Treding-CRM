import { Injectable, Logger } from '@nestjs/common'

interface CacheEntry<T> {
  data: T
  expiresAt: Date
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)
  private cache: Map<string, CacheEntry<any>> = new Map()

  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
    this.cache.set(key, { data, expiresAt })
    this.logger.debug(`Cache set: ${key} (TTL: ${ttlSeconds}s)`)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  deleteByPattern(pattern: string): number {
    let deleted = 0
    const regex = new RegExp(pattern)

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    this.logger.debug(`Deleted ${deleted} cache entries matching pattern: ${pattern}`)
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.logger.debug('Cache cleared')
  }

  getStats(): {
    size: number
    keys: string[]
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  async remember<T>(
    key: string,
    ttlSeconds: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached) {
      this.logger.debug(`Cache hit: ${key}`)
      return cached
    }

    this.logger.debug(`Cache miss: ${key}`)
    const data = await fn()
    this.set(key, data, ttlSeconds)
    return data
  }

  async rememberSync<T>(
    key: string,
    ttlSeconds: number,
    fn: () => T
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached) {
      this.logger.debug(`Cache hit: ${key}`)
      return cached
    }

    this.logger.debug(`Cache miss: ${key}`)
    const data = fn()
    this.set(key, data, ttlSeconds)
    return data
  }

  // Cache invalidation helpers
  invalidateCustomers(): void {
    this.deleteByPattern('customers:*')
  }

  invalidateItems(): void {
    this.deleteByPattern('items:*')
  }

  invalidateTransactions(): void {
    this.deleteByPattern('transactions:*')
  }

  invalidateDashboard(): void {
    this.deleteByPattern('dashboard:*')
  }

  invalidatePayments(): void {
    this.deleteByPattern('payments:*')
  }
}
