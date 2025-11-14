import { Controller, Get, Param } from '@nestjs/common';
import { CertificatesService } from './certificates.service';

/**
 * Public Certificates Controller
 * Handles public certificate verification (no authentication required)
 */
@Controller('certificates')
export class CertificatesPublicController {
  constructor(private readonly certificatesService: CertificatesService) {}

  /**
   * GET /certificates/verify/:regNo
   * Verify certificate by registration number (public)
   */
  @Get('verify/:regNo')
  async verify(@Param('regNo') regNo: string): Promise<{
    id: string;
    registrationNo: string;
    isValid: boolean;
    issuedAt: Date;
    revokedAt: Date | null;
    cooperativeName?: string;
  } | null> {
    return this.certificatesService.verify(regNo);
  }
}
