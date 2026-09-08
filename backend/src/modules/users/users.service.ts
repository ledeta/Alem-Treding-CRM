import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto, createdBy?: number) {
    const { username, email, fullName, phone, password, roleId } =
      createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Find role
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    const user = this.userRepository.create({
      username,
      email,
      fullName,
      phone,
      passwordHash,
      role,
      createdBy,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User created: ${username}`);

    return this.findById(savedUser.id);
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      relations: ['role'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByRole(roleId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      where: { role: { id: roleId } },
      relations: ['role'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);

    // Check if email is being updated and if it's unique
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash new password if provided
    if (updateUserDto.password) {
      updateUserDto['passwordHash'] = await argon2.hash(updateUserDto.password);
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`User updated: ${user.username}`);
    return updatedUser;
  }

  async updateStatus(id: number, status: string) {
    const validStatuses = ['Active', 'Suspended', 'Released', 'Terminated', 'Deleted'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const user = await this.findById(id);
    user.status = status;

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`User ${user.username} status updated to: ${status}`);

    return updatedUser;
  }

  async delete(id: number) {
    const user = await this.findById(id);

    // Soft delete
    await this.updateStatus(id, 'Deleted');

    this.logger.log(`User deleted: ${user.username}`);
    return { message: 'User deleted successfully' };
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      where: [
        { username: query },
        { email: query },
        { fullName: query },
      ],
      relations: ['role'],
      skip,
      take: limit,
    });

    return {
      data: users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getActiveUsers() {
    return this.userRepository.find({
      where: { status: 'Active' },
      relations: ['role'],
    });
  }

  async countByRole(roleId: number) {
    return this.userRepository.count({
      where: { role: { id: roleId } },
    });
  }
}
