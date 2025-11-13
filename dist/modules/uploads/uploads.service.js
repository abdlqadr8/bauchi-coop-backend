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
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("@/prisma/prisma.service");
const uuid_1 = require("uuid");
/**
 * Uploads Service
 * Generates presigned URLs and stores document metadata
 */
let UploadsService = class UploadsService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger('UploadsService');
    }
    /**
     * Generate presigned URL for file upload
     * TODO: Integrate with AWS S3 or similar service for real presigned URLs
     */
    async generatePresignedUrl(dto, applicationId) {
        // Generate unique file key
        const fileKey = `uploads/${(0, uuid_1.v4)()}/${dto.filename}`;
        // TODO: Generate real presigned URL from S3
        // const command = new PutObjectCommand({
        //   Bucket: this.configService.get('AWS_S3_BUCKET'),
        //   Key: fileKey,
        //   ContentType: dto.filetype,
        // });
        // const uploadUrl = await getSignedUrl(s3Client, command, {
        //   expiresIn: 3600,
        // });
        // Mock presigned URL (for development)
        const uploadUrl = `https://s3-presigned.mock/${fileKey}?token=mock_token&expires=3600`;
        const fileUrl = `https://s3.mock/${fileKey}`;
        this.logger.log(`Presigned URL generated for: ${dto.filename}`);
        return {
            uploadUrl,
            fileUrl,
            fileKey,
        };
    }
    /**
     * Store document metadata after upload
     */
    async storeDocumentMetadata(applicationId, filename, fileUrl, documentType) {
        const document = await this.prisma.document.create({
            data: {
                applicationId,
                filename,
                fileUrl,
                documentType,
            },
            select: {
                id: true,
                filename: true,
                fileUrl: true,
            },
        });
        this.logger.log(`Document metadata stored: ${document.id}`);
        return document;
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map