import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { username, password } = loginDto;

    // Find user by username or email
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.username = :username OR user.email = :email', {
        username,
        email: username,
      })
      .getOne();

    if (!user) {
      // Log failed login attempt
      await this.auditService.log({
        userId: username, // Log username if user not found
        action: 'LOGIN',
        module: 'AUTH',
        status: 'FAILED',
        description: 'User not found',
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account status
    if (user.status !== 'Active') {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN',
        module: 'AUTH',
        status: 'FAILED',
        description: `Account is ${user.status}`,
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException(
        `Account is ${user.status}. Please contact administrator.`,
      );
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN',
        module: 'AUTH',
        status: 'FAILED',
        description: 'Invalid password',
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Log successful login
    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      module: 'AUTH',
      status: 'SUCCESS',
      description: `User ${user.username} logged in`,
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      });

      // Check if token exists in DB and is not revoked
      const refreshTokenRecord = await this.refreshTokenRepository.findOne({
        where: {
          token,
          isRevoked: false,
        },
        relations: ['user', 'user.role'],
      });

      if (!refreshTokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token has expired
      if (new Date() > refreshTokenRecord.expiresAt) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      const user = refreshTokenRecord.user;

      // Check account status
      if (user.status !== 'Active') {
        throw new UnauthorizedException('Account is not active');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user);

      // Revoke old refresh token
      refreshTokenRecord.isRevoked = true;
      await this.refreshTokenRepository.save(refreshTokenRecord);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(user: User, token: string, ipAddress?: string, userAgent?: string) {
    // Revoke all user's refresh tokens
    await this.refreshTokenRepository.update(
      { user: { id: user.id } },
      { isRevoked: true },
    );

    // Log logout event
    await this.auditService.log({
      userId: user.id,
      action: 'LOGOUT',
      module: 'AUTH',
      status: 'SUCCESS',
      description: `User ${user.username} logged out`,
      ipAddress,
      userAgent,
    });

    this.logger.log(`User ${user.username} logged out`);
    return { message: 'Successfully logged out' };
  }

  private async generateTokens(user: User) {
    // Access Token (short-lived)
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
      },
      {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRATION || '15m',
      },
    );

    // Refresh Token (long-lived)
    const refreshTokenPayload = this.jwtService.sign(
      {
        sub: user.id,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      },
    );

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      user,
      token: refreshTokenPayload,
      expiresAt,
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenPayload,
    };
  }

  async validateUser(userId: number) {
    return this.usersService.findById(userId);
  }

  async changePassword(userId: number, changePasswordDto: any) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Fetch the user with password hash
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await argon2.verify(user.passwordHash, currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await argon2.hash(newPassword);

    // Update password
    user.passwordHash = hashedNewPassword;
    await this.userRepository.save(user);

    // Log password change
    await this.auditService.log({
      userId: user.id,
      action: 'PASSWORD_CHANGE',
      module: 'AUTH',
      status: 'SUCCESS',
      description: `User ${user.username} changed password`,
    });

    this.logger.log(`Password changed for user: ${user.username}`);

    return {
      message: 'Password changed successfully',
      success: true,
    };
  }
}
