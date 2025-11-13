import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
/**
 * Users Service
 * Handles user CRUD operations and admin functions
 */
export declare class UsersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Get all users (admin only)
     */
    findAll(skip?: number, take?: number): Promise<{
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
    }>;
    /**
     * Get user by ID
     */
    findById(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    /**
     * Create new user
     */
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        createdAt: Date;
    }>;
    /**
     * Update user info
     */
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        updatedAt: Date;
    }>;
    /**
     * Update user status (activate/deactivate/suspend)
     */
    updateStatus(id: string, status: string): Promise<{
        id: string;
        email: string;
        status: string;
    }>;
    /**
     * Delete user
     */
    delete(id: string): Promise<{
        id: string;
        email: string;
    }>;
}
//# sourceMappingURL=users.service.d.ts.map