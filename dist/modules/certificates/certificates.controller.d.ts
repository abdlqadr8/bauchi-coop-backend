import { CertificatesService } from './certificates.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { RevokeCertificateDto } from './dto/revoke-certificate.dto';
/**
 * Certificates Controller (Admin)
 * Handles certificate generation and revocation
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
}
//# sourceMappingURL=certificates.controller.d.ts.map