import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IpAddress } from '../activity-logs/decorators/ip-address.decorator';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Auth Controller
 * Handles authentication endpoints: login, refresh, logout
 */
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Login with email and password
   * Returns access and refresh tokens
   */
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() ipAddress?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    mustChangePassword?: boolean;
  }> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      this.logger.warn(`Login failed for email: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.authService.login(user, ipAddress);
  }

  /**
   * POST /auth/refresh
   * Get new access token using refresh token
   */
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Revoke all refresh tokens for user
   * Requires JWT authentication
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: RequestWithUser,
    @IpAddress() ipAddress?: string,
  ): Promise<{ message: string }> {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }

    await this.authService.logout(req.user.userId, ipAddress);
    return { message: 'Logged out successfully' };
  }

  /**
   * POST /auth/change-password
   * Change user password
   * Requires JWT authentication
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }

    return this.authService.changePassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
