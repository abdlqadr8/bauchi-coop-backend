import { SetMetadata } from "@nestjs/common";

/**
 * Roles decorator - attach required roles to endpoints
 * Usage: @Roles('ADMIN', 'SYSTEM_ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
