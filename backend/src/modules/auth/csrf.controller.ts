import { Controller, Get, Req, Post, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('security')
@Controller('csrf')
export class CsrfController {
  @Public()
  @Get('token')
  @ApiOperation({ summary: 'Get CSRF token for forms' })
  getCsrfToken(@Req() req: any) {
    return {
      csrfToken: req.csrfToken(),
    };
  }
}
