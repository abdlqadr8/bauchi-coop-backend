import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Users Controller
 * Admin endpoints for user management
 */
@Controller('api/v1/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /admin/users
   * List all users with pagination
   */
  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
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
    return this.usersService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  /**
   * GET /admin/users/:id
   * Get user by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<{
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
    return this.usersService.findById(id);
  }

  /**
   * POST /admin/users
   * Create new user
   */
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: RequestWithUser,
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: Date;
  }> {
    return this.usersService.create(createUserDto, req.user?.userId);
  }

  /**
   * PATCH /admin/users/:id
   * Update user info
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    updatedAt: Date;
  }> {
    return this.usersService.update(id, updateUserDto, req.user?.userId);
  }

  /**
   * PATCH /admin/users/:id/status
   * Update user status
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status }: { status: string },
    @Req() req: RequestWithUser,
  ): Promise<{ id: string; email: string; status: string }> {
    return this.usersService.updateStatus(id, status, req.user?.userId);
  }

  /**
   * DELETE /admin/users/:id
   * Delete user
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ id: string; email: string }> {
    return this.usersService.delete(id, req.user?.userId);
  }
}
