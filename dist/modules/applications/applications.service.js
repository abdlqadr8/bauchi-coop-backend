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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("@/prisma/prisma.service");
/**
 * Applications Service
 * Handles cooperative application submissions and admin operations
 */
let ApplicationsService = class ApplicationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('ApplicationsService');
    }
    /**
     * Submit new cooperative application (public)
     */
    async submitApplication(dto) {
        // Use transaction to create application and documents atomically
        const application = (await this.prisma.$transaction(async (tx) => {
            const app = await tx.application.create({
                data: {
                    cooperativeName: dto.cooperativeName,
                    registrationNumber: dto.registrationNumber,
                    email: dto.emailAddress,
                    phone: dto.phoneNumber,
                    address: dto.address,
                    status: 'NEW',
                },
            });
            // Create associated documents if provided
            if (dto.documents && dto.documents.length > 0) {
                await tx.document.createMany({
                    data: dto.documents.map((doc) => ({
                        applicationId: app.id,
                        filename: doc.filename,
                        fileUrl: doc.fileUrl,
                        documentType: doc.documentType,
                    })),
                });
            }
            return app;
        }));
        this.logger.log(`Application submitted: ${application.id} (${dto.cooperativeName})`);
        return {
            id: application.id,
            cooperativeName: application.cooperativeName,
            registrationNumber: application.registrationNumber,
            email: application.email,
            phone: application.phone,
            address: application.address,
            status: application.status,
            submittedAt: application.submittedAt,
        };
    }
    /**
     * Get all applications (admin)
     */
    async findAll(skip = 0, take = 10, status) {
        const where = status ? { status: status } : {};
        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                skip,
                take,
                select: {
                    id: true,
                    cooperativeName: true,
                    email: true,
                    phone: true,
                    status: true,
                    submittedAt: true,
                    reviewedAt: true,
                },
            }),
            this.prisma.application.count({ where }),
        ]);
        return { applications, total };
    }
    /**
     * Get application by ID with documents
     */
    async findById(id) {
        return this.prisma.application.findUnique({
            where: { id },
            include: {
                documents: {
                    select: {
                        id: true,
                        filename: true,
                        fileUrl: true,
                        documentType: true,
                        uploadedAt: true,
                    },
                },
            },
        });
    }
    /**
     * Update application status (admin)
     */
    async updateStatus(id, dto, reviewedByUserId) {
        const application = await this.prisma.application.findUnique({
            where: { id },
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application ${id} not found`);
        }
        const updated = await this.prisma.application.update({
            where: { id },
            data: {
                status: dto.status,
                notes: dto.notes,
                reviewedAt: new Date(),
                reviewedBy: reviewedByUserId,
            },
            select: {
                id: true,
                cooperativeName: true,
                status: true,
                reviewedAt: true,
            },
        });
        this.logger.log(`Application ${id} status updated to ${dto.status}`);
        return updated;
    }
    /**
     * Get application statistics
     */
    async getStats() {
        const [total, newCount, underReview, approved, rejected, flagged] = await Promise.all([
            this.prisma.application.count(),
            this.prisma.application.count({ where: { status: 'NEW' } }),
            this.prisma.application.count({
                where: { status: 'UNDER_REVIEW' },
            }),
            this.prisma.application.count({ where: { status: 'APPROVED' } }),
            this.prisma.application.count({ where: { status: 'REJECTED' } }),
            this.prisma.application.count({ where: { status: 'FLAGGED' } }),
        ]);
        return {
            total,
            new: newCount,
            underReview,
            approved,
            rejected,
            flagged,
        };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map