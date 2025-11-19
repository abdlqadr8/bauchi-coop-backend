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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

/**
 * Certificates Service
 * Handles certificate generation, revocation, and verification
 */
@Injectable()
export class CertificatesService {
  private readonly logger = new Logger('CertificatesService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Generate certificate for approved application
   */
  async generate(
    dto: GenerateCertificateDto,
    generatedBy?: string,
  ): Promise<{
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

    // Log activity
    await this.activityLogsService.logActivity({
      userId: generatedBy,
      applicationId: dto.applicationId,
      action: 'GENERATE_CERTIFICATE',
      description: `Generated certificate ${registrationNo} for application`,
      metadata: {
        certificateId: certificate.id,
        registrationNo,
      },
    });

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
    revokedBy?: string,
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

    // Log activity
    await this.activityLogsService.logActivity({
      userId: revokedBy,
      applicationId: certificate.applicationId,
      action: 'REVOKE_CERTIFICATE',
      description: `Revoked certificate ${certificate.registrationNo}`,
      metadata: {
        certificateId: revoked.id,
        registrationNo: revoked.registrationNo,
        reason: dto.revocationReason,
      },
    });

    return {
      id: revoked.id,
      registrationNo: revoked.registrationNo,
      revokedAt: revoked.revokedAt!,
    };
  }

  /**
   * Get all certificates (admin)
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
    status?: string,
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
    try {
      let where: any = {};

      // Filter by status: issued, revoked, or all
      if (status === 'revoked') {
        where.revokedAt = { not: null };
      } else if (status === 'issued') {
        where.revokedAt = null;
      }

      const [certificates, total] = await Promise.all([
        this.prisma.certificate.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            registrationNo: true,
            certificateUrl: true,
            issuedAt: true,
            revokedAt: true,
            revocationReason: true,
            application: {
              select: {
                cooperativeName: true,
                email: true,
              },
            },
          },
          orderBy: { issuedAt: 'desc' },
        }),
        this.prisma.certificate.count({ where }),
      ]);

      this.logger.debug(
        `Raw certificates from DB:`,
        JSON.stringify(certificates, null, 2),
      );

      return {
        certificates: certificates.map((cert) => ({
          id: cert.id,
          certificateId: cert.id.substring(0, 8).toUpperCase(),
          registrationNo: cert.registrationNo,
          certificateUrl: cert.certificateUrl,
          status: cert.revokedAt ? 'revoked' : 'issued',
          issuedAt: cert.issuedAt,
          revokedAt: cert.revokedAt,
          revocationReason: cert.revocationReason,
          application: cert.application,
        })),
        total,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch certificates: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
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
