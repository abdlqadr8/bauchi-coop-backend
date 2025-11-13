import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
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
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    /**
     * POST /auth/login
     * Login with email and password
     * Returns access and refresh tokens
     */
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * POST /auth/refresh
     * Get new access token using refresh token
     */
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * POST /auth/logout
     * Revoke all refresh tokens for user
     * Requires JWT authentication
     */
    logout(req: RequestWithUser): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=auth.controller.d.ts.map