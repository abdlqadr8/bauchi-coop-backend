"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("@/prisma/prisma.service");
/**
 * AuthService handles authentication logic:
 * - User validation
 * - JWT token generation
 * - Refresh token rotation
 * - Token revocation
 */
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger("AuthService");
    }
    /**
     * Validate user credentials (email + password)
     */
    async validateUser(email, password) {
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
    async login(user) {
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
    async refreshToken(refreshToken) {
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
                throw new common_1.UnauthorizedException("Invalid or expired refresh token");
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException("User not found");
            }
            // Revoke old token
            await this.prisma.refreshToken.update({
                where: { id: tokenRecord.id },
                data: { revokedAt: new Date() },
            });
            // Issue new tokens
            return this.login(user);
        }
        catch (error) {
            this.logger.error(`Token refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
    }
    /**
     * Logout user by revoking all refresh tokens
     */
    async logout(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revokedAt: new Date() },
        });
        this.logger.log(`User logged out: ${userId}`);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map