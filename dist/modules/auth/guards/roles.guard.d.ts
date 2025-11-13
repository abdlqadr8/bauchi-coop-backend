import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
/**
 * Roles Guard - checks if user has required role
 * Works with @Roles() decorator
 */
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=roles.guard.d.ts.map