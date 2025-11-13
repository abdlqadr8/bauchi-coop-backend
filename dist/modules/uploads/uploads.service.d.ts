import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { PresignUrlDto } from './dto/presign-url.dto';
/**
 * Uploads Service
 * Generates presigned URLs and stores document metadata
 */
export declare class UploadsService {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    /**
     * Generate presigned URL for file upload
     * TODO: Integrate with AWS S3 or similar service for real presigned URLs
     */
    generatePresignedUrl(dto: PresignUrlDto, applicationId?: string): Promise<{
        uploadUrl: string;
        fileUrl: string;
        fileKey: string;
    }>;
    /**
     * Store document metadata after upload
     */
    storeDocumentMetadata(applicationId: string, filename: string, fileUrl: string, documentType: string): Promise<{
        id: string;
        filename: string;
        fileUrl: string;
    }>;
}
//# sourceMappingURL=uploads.service.d.ts.map