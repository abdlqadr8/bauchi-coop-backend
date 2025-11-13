import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { RevokeCertificateDto } from './dto/revoke-certificate.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Certificates Service
 * Handles certificate generation, revocation, and verification
 */
@Injectable()
export class CertificatesService {
  private readonly logger = new Logger('CertificatesService');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate certificate for approved application
   */
  async generate(dto: GenerateCertificateDto): Promise<{
    id: string;
    registrationNo: string;
    certificateUrl: string;
    issuedAt: Date;
  }> {
    // Check if application exists and is approved
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
    });

    if (!application) {
      throw new NotFoundException(`Application not found`);
    }

    if (application.status !== 'APPROVED') {
      throw new BadRequestException(
        `Application must be APPROVED to generate certificate (current: ${application.status})`,
      );
    }

    // Check if certificate already exists
    const existing = await this.prisma.certificate.findFirst({
      where: { applicationId: dto.applicationId },
    });

    if (existing && !existing.revokedAt) {
      throw new BadRequestException(
        `Certificate already exists for this application`,
      );
    }

    // Generate registration number (placeholder format)
    const registrationNo = `REG-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Generate certificate URL (placeholder - would be actual PDF URL or S3 link)
    const certificateUrl = `https://certificates.bauchicoop.local/${registrationNo}.pdf`;

    const certificate = await this.prisma.certificate.create({
      data: {
        applicationId: dto.applicationId,
        registrationNo,
        certificateUrl,
      },
    });

    this.logger.log(`Certificate generated: ${certificate.id}`);

    return {
      id: certificate.id,
      registrationNo: certificate.registrationNo,
      certificateUrl: certificate.certificateUrl,
      issuedAt: certificate.issuedAt,
    };
  }

  /**
   * Revoke a certificate
   */
  async revoke(
    id: string,
    dto: RevokeCertificateDto,
  ): Promise<{
    id: string;
    registrationNo: string;
    revokedAt: Date;
  }> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.revokedAt) {
      throw new BadRequestException('Certificate is already revoked');
    }

    const revoked = await this.prisma.certificate.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        revocationReason: dto.revocationReason,
      },
    });

    this.logger.log(`Certificate revoked: ${revoked.id}`);

    return {
      id: revoked.id,
      registrationNo: revoked.registrationNo,
      revokedAt: revoked.revokedAt!,
    };
  }

  /**
   * Verify certificate by registration number (public)
   */
  async verify(registrationNo: string): Promise<{
    id: string;
    registrationNo: string;
    isValid: boolean;
    issuedAt: Date;
    revokedAt: Date | null;
    cooperativeName?: string;
  } | null> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { registrationNo },
      include: {
        application: {
          select: {
            cooperativeName: true,
          },
        },
      },
    });

    if (!certificate) {
      return null;
    }

    return {
      id: certificate.id,
      registrationNo: certificate.registrationNo,
      isValid: !certificate.revokedAt,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
      cooperativeName: certificate.application?.cooperativeName,
    };
  }
}
