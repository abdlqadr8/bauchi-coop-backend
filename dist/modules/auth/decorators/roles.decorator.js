"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
const common_1 = require("@nestjs/common");
/**
 * Roles decorator - attach required roles to endpoints
 * Usage: @Roles('ADMIN', 'SYSTEM_ADMIN')
 */
const Roles = (...roles) => (0, common_1.SetMetadata)("roles", roles);
exports.Roles = Roles;
//# sourceMappingURL=roles.decorator.js.map