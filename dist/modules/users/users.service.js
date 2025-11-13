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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("@/prisma/prisma.service");
/**
 * Users Service
 * Handles user CRUD operations and admin functions
 */
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('UsersService');
    }
    /**
     * Get all users (admin only)
     */
    async findAll(skip = 0, take = 10) {
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
    async findById(id) {
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
    async create(dto) {
        // Check if user already exists
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException(`User with email ${dto.email} already exists`);
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: (dto.role || 'USER'),
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
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User ${id} not found`);
        }
        // Check email uniqueness if changing email
        if (dto.email && dto.email !== user.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existing) {
                throw new common_1.ConflictException(`Email ${dto.email} is already in use`);
            }
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role,
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
    async updateStatus(id, status) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User ${id} not found`);
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: { status: status },
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
    async delete(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User ${id} not found`);
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map