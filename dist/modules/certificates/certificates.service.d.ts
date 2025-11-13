import { PrismaService } from '@/prisma/prisma.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { RevokeCertificateDto } from './dto/revoke-certificate.dto';
/**
 * Certificates Service
 * Handles certificate generation, revocation, and verification
 */
export declare class CertificatesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Generate certificate for approved application
     */
    generate(dto: GenerateCertificateDto): Promise<{
        id: string;
        registrationNo: string;
        certificateUrl: string;
        issuedAt: Date;
    }>;
    /**
     * Revoke a certificate
     */
    revoke(id: string, dto: RevokeCertificateDto): Promise<{
        id: string;
        registrationNo: string;
        revokedAt: Date;
    }>;
    /**
     * Verify certificate by registration number (public)
     */
    verify(registrationNo: string): Promise<{
        id: string;
        registrationNo: string;
        isValid: boolean;
        issuedAt: Date;
        revokedAt: Date | null;
        cooperativeName?: string;
    } | null>;
}
//# sourceMappingURL=certificates.service.d.ts.map