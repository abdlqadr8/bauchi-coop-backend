import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

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
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger("AuthController");

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Login with email and password
   * Returns access and refresh tokens
   */
  @Post("login")
  async login(@Body() loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );

    if (!user) {
      this.logger.warn(`Login failed for email: ${loginDto.email}`);
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.authService.login(user);
  }

  /**
   * POST /auth/refresh
   * Get new access token using refresh token
   */
  @Post("refresh")
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
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: RequestWithUser): Promise<{ message: string }> {
    if (!req.user) {
      throw new UnauthorizedException("User not found");
    }

    await this.authService.logout(req.user.userId);
    return { message: "Logged out successfully" };
  }
}
