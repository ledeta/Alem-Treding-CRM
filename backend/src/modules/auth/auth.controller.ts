import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/password-reset.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login with credentials' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts. Try again later.',
  })
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    this.logger.log(`Login attempt for user: ${loginDto.username} from ${ipAddress}`);
    try {
      const result = await this.authService.login(loginDto, ipAddress, userAgent);
      return result;
    } catch (error) {
      this.logger.warn(`Failed login for user: ${loginDto.username}`);
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(@Request() req: any) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    this.logger.log(`Logout for user: ${req.user.username}`);
    return this.authService.logout(req.user, req.headers.authorization, ipAddress, userAgent);
  }

  @Post('verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
  })
  verify(@Request() req) {
    return {
      valid: true,
      user: req.user,
    };
  }

  @Public()
  @Get('csrf-token')
  @ApiOperation({ summary: 'Get CSRF token' })
  getCsrfToken(@Request() req: any) {
    return {
      csrfToken: req.csrfToken(),
    };
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ) {
    this.logger.log(`Password change requested for user: ${req.user.username}`);
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }
}
