import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";
/**
 * AuthService handles authentication logic:
 * - User validation
 * - JWT token generation
 * - Refresh token rotation
 * - Token revocation
 */
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    /**
     * Validate user credentials (email + password)
     */
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
        password: string;
        role: string;
        firstName: string;
        lastName: string;
    } | null>;
    /**
     * Generate access and refresh tokens
     */
    login(user: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Refresh access token using refresh token
     */
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Logout user by revoking all refresh tokens
     */
    logout(userId: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map