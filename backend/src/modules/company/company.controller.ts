import { Controller, Get, Post, Body } from '@nestjs/common'
import { CompanyService } from './company.service'

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('logo')
  async getLogo() {
    return this.companyService.getLogo()
  }

  @Post('logo')
  async saveLogo(@Body() data: { logo: string }) {
    return this.companyService.saveLogo(data.logo)
  }
}
