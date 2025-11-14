"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesController = void 0;
const common_1 = require("@nestjs/common");
const certificates_service_1 = require("./certificates.service");
const generate_certificate_dto_1 = require("./dto/generate-certificate.dto");
const revoke_certificate_dto_1 = require("./dto/revoke-certificate.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
/**
 * Certificates Controller (Admin)
 * Handles certificate generation and revocation
 */
let CertificatesController = class CertificatesController {
    constructor(certificatesService) {
        this.certificatesService = certificatesService;
    }
    /**
     * POST /admin/certificates
     * Generate new certificate (admin)
     */
    async generate(generateCertificateDto) {
        return this.certificatesService.generate(generateCertificateDto);
    }
    /**
     * PATCH /admin/certificates/:id/revoke
     * Revoke certificate (admin)
     */
    async revoke(id, revokeCertificateDto) {
        return this.certificatesService.revoke(id, revokeCertificateDto);
    }
};
exports.CertificatesController = CertificatesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SYSTEM_ADMIN', 'ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_certificate_dto_1.GenerateCertificateDto]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "generate", null);
__decorate([
    (0, common_1.Patch)(':id/revoke'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SYSTEM_ADMIN', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, revoke_certificate_dto_1.RevokeCertificateDto]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "revoke", null);
exports.CertificatesController = CertificatesController = __decorate([
    (0, common_1.Controller)('admin/certificates'),
    __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
], CertificatesController);
//# sourceMappingURL=certificates.controller.js.map