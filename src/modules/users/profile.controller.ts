import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Profile Controller
 * Endpoints for current logged-in user to manage their own profile
 */
@Controller('api/v1/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /profile
   * Get current user's profile
   */
  @Get()
  async getProfile(@Req() req: RequestWithUser): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    status: string;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.usersService.getProfile(userId);
  }

  /**
   * PATCH /profile
   * Update current user's profile
   */
  @Patch()
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    updatedAt: Date;
  }> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
}
