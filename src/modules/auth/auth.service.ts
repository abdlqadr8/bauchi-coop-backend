import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "@/prisma/prisma.service";

/**
 * AuthService handles authentication logic:
 * - User validation
 * - JWT token generation
 * - Refresh token rotation
 * - Token revocation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Validate user credentials (email + password)
   */
  async validateUser(
    email: string,
    password: string
  ): Promise<{
    id: string;
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
  } | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  async login(user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_EXPIRES_IN", "15m"),
    });

    const refreshTokenData = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN", "7d"),
    });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenData,
        userId: user.id,
        expiresAt,
      },
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken,
      refreshToken: refreshTokenData,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      // Check if token exists in DB and not revoked
      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: payload.sub,
          revokedAt: null,
        },
      });

      if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
        throw new UnauthorizedException("Invalid or expired refresh token");
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      // Revoke old token
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });

      // Issue new tokens
      return this.login(user);
    } catch (error) {
      this.logger.error(
        `Token refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Logout user by revoking all refresh tokens
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`User logged out: ${userId}`);
  }
}
