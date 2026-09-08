import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../modules/auth/entities/user.entity';
import { Role } from '../modules/auth/entities/role.entity';

@Injectable()
export class SeedsService implements OnModuleInit {
  private readonly logger = new Logger(SeedsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('🌱 Starting database seed...');
      await this.seedDefaultUsers();
      this.logger.log('✅ Seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed database', error.message);
      // Don't crash the app if seeding fails - log and continue
      // This allows debugging what went wrong
    }
  }

  async seedDefaultUsers() {
    try {
      // Ensure roles exist
      await this.ensureRolesExist();

      // Check if admin already exists
      const adminExists = await this.userRepository.findOne({
        where: { username: 'admin' },
      });

      if (adminExists) {
        this.logger.log('ℹ️  Admin user already exists, skipping seed');
        return;
      }

      this.logger.log('🔨 Creating default admin user...');

      // Get admin role
      const adminRole = await this.roleRepository.findOne({
        where: { name: 'admin' },
      });

      if (!adminRole) {
        this.logger.error('❌ Admin role not found in database');
        return;
      }

      // Create default admin user
      const adminPasswordHash = await argon2.hash('Admin@2024!');
      
      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@alem.com',
        fullName: 'System Administrator',
        passwordHash: adminPasswordHash,
        role: adminRole,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.userRepository.save(admin);
      this.logger.log('✅ Default admin user created successfully');
      this.logger.log('   👤 Username: admin');
      this.logger.log('   🔑 Password: Admin@2024!');
      this.logger.log('   📧 Email: admin@alem.com');

      // Create default sales users
      await this.createDefaultSalesUsers();
    } catch (error) {
      this.logger.error(`Error in seedDefaultUsers: ${error.message}`, error.stack);
      throw error; // Re-throw so onModuleInit can catch and log
    }
  }

  private async ensureRolesExist() {
    try {
      const roleNames = ['admin', 'sales', 'customer', 'manager'];
      
      for (const roleName of roleNames) {
        const exists = await this.roleRepository.findOne({
          where: { name: roleName },
        });

        if (!exists) {
          const role = this.roleRepository.create({
            name: roleName,
            description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`,
          });
          await this.roleRepository.save(role);
          this.logger.log(`✅ Created role: ${roleName}`);
        } else {
          this.logger.log(`ℹ️  Role exists: ${roleName}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in ensureRolesExist: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async createDefaultSalesUsers() {
    try {
      const salesUsernames = ['salesperson1', 'salesperson2', 'salesperson3'];
      const salesRole = await this.roleRepository.findOne({
        where: { name: 'sales' },
      });

      if (!salesRole) {
        this.logger.error('❌ Sales role not found');
        return;
      }

      for (const username of salesUsernames) {
        const exists = await this.userRepository.findOne({
          where: { username },
        });

        if (exists) {
          this.logger.log(`ℹ️  Sales user exists: ${username}`);
          continue;
        }

        const passwordHash = await argon2.hash('Sales@2024!');
        const salesUser = this.userRepository.create({
          username,
          email: `${username}@alem.com`,
          fullName: `Sales User - ${username}`,
          passwordHash,
          role: salesRole,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.userRepository.save(salesUser);
        this.logger.log(`✅ Created sales user: ${username}`);
      }
    } catch (error) {
      this.logger.error(`Error in createDefaultSalesUsers: ${error.message}`, error.stack);
      throw error;
    }
  }
}
