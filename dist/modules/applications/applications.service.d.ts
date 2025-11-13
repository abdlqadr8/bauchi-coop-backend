import { PrismaService } from "@/prisma/prisma.service";
import { SubmitApplicationDto } from "./dto/submit-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
/**
 * Applications Service
 * Handles cooperative application submissions and admin operations
 */
export declare class ApplicationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Submit new cooperative application (public)
     */
    submitApplication(dto: SubmitApplicationDto): Promise<{
        id: string;
        cooperativeName: string;
        email: string;
        phone: string;
        status: string;
        submittedAt: Date;
    }>;
    /**
     * Get all applications (admin)
     */
    findAll(skip?: number, take?: number, status?: string): Promise<{
        applications: Array<{
            id: string;
            cooperativeName: string;
            email: string;
            phone: string;
            status: string;
            submittedAt: Date;
            reviewedAt: Date | null;
        }>;
        total: number;
    }>;
    /**
     * Get application by ID with documents
     */
    findById(id: string): Promise<{
        id: string;
        cooperativeName: string;
        registrationNumber: string | null;
        email: string;
        phone: string;
        address: string | null;
        status: string;
        submittedAt: Date;
        reviewedAt: Date | null;
        reviewedBy: string | null;
        notes: string | null;
        documents: Array<{
            id: string;
            filename: string;
            fileUrl: string;
            documentType: string;
            uploadedAt: Date;
        }>;
    } | null>;
    /**
     * Update application status (admin)
     */
    updateStatus(id: string, dto: UpdateApplicationStatusDto, reviewedByUserId?: string): Promise<{
        id: string;
        cooperativeName: string;
        status: string;
        reviewedAt: Date | null;
    }>;
    /**
     * Get application statistics
     */
    getStats(): Promise<{
        total: number;
        new: number;
        underReview: number;
        approved: number;
        rejected: number;
        flagged: number;
    }>;
}
//# sourceMappingURL=applications.service.d.ts.map