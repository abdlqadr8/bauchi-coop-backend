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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("@/prisma/prisma.service");
const uuid_1 = require("uuid");
/**
 * Certificates Service
 * Handles certificate generation, revocation, and verification
 */
let CertificatesService = class CertificatesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('CertificatesService');
    }
    /**
     * Generate certificate for approved application
     */
    async generate(dto) {
        // Check if application exists and is approved
        const application = await this.prisma.application.findUnique({
            where: { id: dto.applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application not found`);
        }
        if (application.status !== 'APPROVED') {
            throw new common_1.BadRequestException(`Application must be APPROVED to generate certificate (current: ${application.status})`);
        }
        // Check if certificate already exists
        const existing = await this.prisma.certificate.findFirst({
            where: { applicationId: dto.applicationId },
        });
        if (existing && !existing.revokedAt) {
            throw new common_1.BadRequestException(`Certificate already exists for this application`);
        }
        // Generate registration number (placeholder format)
        const registrationNo = `REG-${Date.now()}-${(0, uuid_1.v4)().substring(0, 8)}`;
        // Generate certificate URL (placeholder - would be actual PDF URL or S3 link)
        const certificateUrl = `https://certificates.bauchicoop.local/${registrationNo}.pdf`;
        const certificate = await this.prisma.certificate.create({
            data: {
                applicationId: dto.applicationId,
                registrationNo,
                certificateUrl,
            },
        });
        this.logger.log(`Certificate generated: ${certificate.id}`);
        return {
            id: certificate.id,
            registrationNo: certificate.registrationNo,
            certificateUrl: certificate.certificateUrl,
            issuedAt: certificate.issuedAt,
        };
    }
    /**
     * Revoke a certificate
     */
    async revoke(id, dto) {
        const certificate = await this.prisma.certificate.findUnique({
            where: { id },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        if (certificate.revokedAt) {
            throw new common_1.BadRequestException('Certificate is already revoked');
        }
        const revoked = await this.prisma.certificate.update({
            where: { id },
            data: {
                revokedAt: new Date(),
                revocationReason: dto.revocationReason,
            },
        });
        this.logger.log(`Certificate revoked: ${revoked.id}`);
        return {
            id: revoked.id,
            registrationNo: revoked.registrationNo,
            revokedAt: revoked.revokedAt,
        };
    }
    /**
     * Verify certificate by registration number (public)
     */
    async verify(registrationNo) {
        const certificate = await this.prisma.certificate.findUnique({
            where: { registrationNo },
            include: {
                application: {
                    select: {
                        cooperativeName: true,
                    },
                },
            },
        });
        if (!certificate) {
            return null;
        }
        return {
            id: certificate.id,
            registrationNo: certificate.registrationNo,
            isValid: !certificate.revokedAt,
            issuedAt: certificate.issuedAt,
            revokedAt: certificate.revokedAt,
            cooperativeName: certificate.application?.cooperativeName,
        };
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map