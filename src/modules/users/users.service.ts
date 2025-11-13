import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Users Service
 * Handles user CRUD operations and admin functions
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all users (admin only)
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
  ): Promise<{
    users: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      status: string;
      lastLogin: Date | null;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total };
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Create new user
   */
  async create(dto: CreateUserDto): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: Date;
  }> {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: (dto.role || 'USER') as any,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    this.logger.log(`User created: ${user.email}`);
    return user;
  }

  /**
   * Update user info
   */
  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    updatedAt: Date;
  }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    // Check email uniqueness if changing email
    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException(`Email ${dto.email} is already in use`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as any,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User updated: ${updated.email}`);
    return updated;
  }

  /**
   * Update user status (activate/deactivate/suspend)
   */
  async updateStatus(
    id: string,
    status: string,
  ): Promise<{
    id: string;
    email: string;
    status: string;
  }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: status as any },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    this.logger.log(`User status updated: ${updated.email} -> ${status}`);
    return updated;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<{ id: string; email: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const deleted = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    this.logger.log(`User deleted: ${deleted.email}`);
    return deleted;
  }
}
