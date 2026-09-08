import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator'

interface RateLimitStore {
  count: number
  resetTime: number
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private store: Map<string, RateLimitStore> = new Map()

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler()
    )

    if (!options) {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest()
    const key = `${request.user?.id || request.ip}:${request.path}`

    const now = Date.now()
    let store = this.store.get(key)

    if (!store || now > store.resetTime) {
      store = {
        count: 0,
        resetTime: now + options.windowMs,
      }
      this.store.set(key, store)
    }

    store.count++

    if (store.count > options.limit) {
      throw new HttpException(
        options.message || `Rate limit exceeded. Max ${options.limit} requests per ${options.windowMs}ms`,
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    return next.handle()
  }
}
