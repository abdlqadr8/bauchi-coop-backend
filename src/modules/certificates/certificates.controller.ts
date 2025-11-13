import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { RevokeCertificateDto } from './dto/revoke-certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Certificates Controller
 * Handles certificate generation, revocation, and public verification
 */
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  /**
   * POST /admin/certificates
   * Generate new certificate (admin)
   */
  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async generate(
    @Body() generateCertificateDto: GenerateCertificateDto,
  ): Promise<{
    id: string;
    registrationNo: string;
    certificateUrl: string;
    issuedAt: Date;
  }> {
    return this.certificatesService.generate(generateCertificateDto);
  }

  /**
   * PATCH /admin/certificates/:id/revoke
   * Revoke certificate (admin)
   */
  @Patch('admin/:id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async revoke(
    @Param('id') id: string,
    @Body() revokeCertificateDto: RevokeCertificateDto,
  ): Promise<{
    id: string;
    registrationNo: string;
    revokedAt: Date;
  }> {
    return this.certificatesService.revoke(id, revokeCertificateDto);
  }

  /**
   * GET /certificates/verify/:regNo
   * Verify certificate by registration number (public)
   */
  @Get('verify/:regNo')
  async verify(
    @Param('regNo') regNo: string,
  ): Promise<{
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
