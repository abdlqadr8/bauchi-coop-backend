import { ApplicationsService } from './applications.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
interface RequestWithUser extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
/**
 * Applications Controller
 * Handles public submissions and admin management
 */
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    /**
     * POST /applications
     * Submit new cooperative application (public)
     */
    submitApplication(submitApplicationDto: SubmitApplicationDto): Promise<{
        id: string;
        cooperativeName: string;
        registrationNumber: string | null;
        email: string;
        phone: string;
        address: string;
        status: string;
        submittedAt: Date;
    }>;
    /**
     * GET /admin/applications
     * List all applications (admin)
     */
    findAll(skip?: string, take?: string, status?: string): Promise<{
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
     * GET /admin/applications/:id
     * Get application by ID with documents (admin)
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
     * PATCH /admin/applications/:id/status
     * Update application status (admin)
     */
    updateStatus(id: string, updateStatusDto: UpdateApplicationStatusDto, req: RequestWithUser): Promise<{
        id: string;
        cooperativeName: string;
        status: string;
        reviewedAt: Date | null;
    }>;
    /**
     * GET /admin/applications/stats/overview
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
export {};
//# sourceMappingURL=applications.controller.d.ts.map