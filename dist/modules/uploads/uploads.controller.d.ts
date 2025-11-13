import { UploadsService } from './uploads.service';
import { PresignUrlDto } from './dto/presign-url.dto';
interface RequestWithUser extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
/**
 * Uploads Controller
 * Handles presigned URLs and document metadata
 */
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    /**
     * POST /uploads/presign
     * Generate presigned URL for file upload
     */
    generatePresignedUrl(presignUrlDto: PresignUrlDto, applicationId?: string): Promise<{
        uploadUrl: string;
        fileUrl: string;
        fileKey: string;
    }>;
    /**
     * POST /uploads/documents/metadata
     * Store document metadata after upload (requires auth)
     */
    storeDocumentMetadata({ applicationId, filename, fileUrl, documentType, }: {
        applicationId: string;
        filename: string;
        fileUrl: string;
        documentType: string;
    }, req: RequestWithUser): Promise<{
        id: string;
        filename: string;
        fileUrl: string;
    }>;
}
export {};
//# sourceMappingURL=uploads.controller.d.ts.map