import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
/**
 * Users Controller
 * Admin endpoints for user management
 */
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    /**
     * GET /admin/users
     * List all users with pagination
     */
    findAll(skip?: string, take?: string): Promise<{
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
     * GET /admin/users/:id
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
     * POST /admin/users
     * Create new user
     */
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        createdAt: Date;
    }>;
    /**
     * PATCH /admin/users/:id
     * Update user info
     */
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        updatedAt: Date;
    }>;
    /**
     * PATCH /admin/users/:id/status
     * Update user status
     */
    updateStatus(id: string, { status }: {
        status: string;
    }): Promise<{
        id: string;
        email: string;
        status: string;
    }>;
    /**
     * DELETE /admin/users/:id
     * Delete user
     */
    delete(id: string): Promise<{
        id: string;
        email: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map