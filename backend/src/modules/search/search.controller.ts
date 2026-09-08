import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { SearchService } from './search.service'
import { JwtAuthGuard } from '../../common/guards/auth.guard'

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('type') type: 'customer' | 'item' | 'transaction' | 'all' = 'all',
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<any> {
    if (!query || query.length < 2) {
      return { error: 'Query must be at least 2 characters' }
    }

    return this.searchService.search({
      query,
      limit,
      offset,
      type,
    })
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return { suggestions: [] }
    }

    const suggestions = await this.searchService.getSearchSuggestions(query)
    return { suggestions }
  }
}
