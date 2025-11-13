import { CertificatesService } from "./certificates.service";
import { GenerateCertificateDto } from "./dto/generate-certificate.dto";
import { RevokeCertificateDto } from "./dto/revoke-certificate.dto";
/**
 * Certificates Controller
 * Handles certificate generation, revocation, and public verification
 */
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    /**
     * POST /admin/certificates
     * Generate new certificate (admin)
     */
    generate(generateCertificateDto: GenerateCertificateDto): Promise<{
        id: string;
        registrationNo: string;
        certificateUrl: string;
        issuedAt: Date;
    }>;
    /**
     * PATCH /admin/certificates/:id/revoke
     * Revoke certificate (admin)
     */
    revoke(id: string, revokeCertificateDto: RevokeCertificateDto): Promise<{
        id: string;
        registrationNo: string;
        revokedAt: Date;
    }>;
    /**
     * GET /certificates/verify/:regNo
     * Verify certificate by registration number (public)
     */
    verify(regNo: string): Promise<{
        id: string;
        registrationNo: string;
        isValid: boolean;
        issuedAt: Date;
        revokedAt: Date | null;
        cooperativeName?: string;
    } | null>;
}
//# sourceMappingURL=certificates.controller.d.ts.map