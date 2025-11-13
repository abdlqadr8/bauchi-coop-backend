/**
 * DTO for submitting a cooperative application
 */
export declare class SubmitApplicationDto {
    cooperativeName: string;
    email: string;
    phone: string;
    address?: string;
    documents?: Array<{
        filename: string;
        fileUrl: string;
        documentType: string;
    }>;
}
//# sourceMappingURL=submit-application.dto.d.ts.map