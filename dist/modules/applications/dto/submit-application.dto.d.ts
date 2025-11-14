/**
 * DTO for submitting a cooperative application
 */
export declare class SubmitApplicationDto {
    cooperativeName: string;
    registrationNumber: string;
    address: string;
    contactPerson: string;
    phoneNumber: string;
    emailAddress: string;
    description: string;
    documents?: Array<{
        filename: string;
        fileUrl: string;
        documentType: string;
    }>;
}
//# sourceMappingURL=submit-application.dto.d.ts.map