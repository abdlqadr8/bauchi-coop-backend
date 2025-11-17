import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
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
 * Certificates Controller (Admin)
 * Handles certificate generation and revocation
 */
@Controller('api/v1/admin/certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  /**
   * GET /admin/certificates
   * List all certificates (admin)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
  ): Promise<{
    certificates: Array<{
      id: string;
      certificateId: string;
      registrationNo: string;
      certificateUrl: string;
      status: string;
      issuedAt: Date;
      revokedAt: Date | null;
      revocationReason: string | null;
      application: {
        cooperativeName: string;
        email: string;
      };
    }>;
    total: number;
  }> {
    return this.certificatesService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
      status,
    );
  }

  /**
   * POST /admin/certificates
   * Generate new certificate (admin)
   */
  @Post()
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
  @Patch(':id/revoke')
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
}
