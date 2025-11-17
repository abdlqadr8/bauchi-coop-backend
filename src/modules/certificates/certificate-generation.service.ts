import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CloudinaryService } from '@/modules/files/cloudinary.service';

@Injectable()
export class CertificateGenerationService {
  private readonly logger = new Logger('CertificateGenerationService');

  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Generate and upload certificate PDF to Cloudinary
   * This would typically be called after admin approval
   */
  async generateCertificate(applicationId: string): Promise<{
    id: string;
    registrationNo: string;
    certificateUrl: string;
    issuedAt: Date;
  }> {
    let finalCertificateUrl;
    try {
      // Get application details
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: { certificates: true },
      });

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.certificates.length > 0) {
        throw new Error('Certificate already exists for this application');
      }

      // Generate unique registration number
      const registrationNo = await this.generateRegistrationNumber();

      // Generate certificate PDF buffer
      const pdfBuffer = await this.generateCertificatePdf(
        application.cooperativeName,
        registrationNo,
        new Date(),
      );

      // Upload PDF to Cloudinary
      try {
        const uploadResult = await this.cloudinaryService.uploadCertificate(
          pdfBuffer,
          `${registrationNo}.pdf`,
          applicationId,
          'application/pdf',
        );
        finalCertificateUrl = uploadResult.url;
        this.logger.log(
          `Certificate PDF uploaded to Cloudinary: ${uploadResult.publicId}`,
        );
      } catch (uploadError: any) {
        this.logger.error(
          `Failed to upload certificate to Cloudinary: ${uploadError?.message}`,
        );
        // Fallback to a placeholder URL if upload fails
        finalCertificateUrl = `https://certificates.bauchicooperative.ng/${registrationNo}`;
        this.logger.warn(
          `Using fallback certificate URL: ${finalCertificateUrl}`,
        );
      }

      // Validate that we have a URL before creating certificate record
      if (!finalCertificateUrl) {
        throw new Error(
          'Failed to generate certificate URL - upload failed and no fallback available',
        );
      }

      // Create certificate record in database
      const certificate = await this.prisma.certificate.create({
        data: {
          applicationId,
          registrationNo,
          certificateUrl: finalCertificateUrl,
          issuedAt: new Date(),
        },
      });

      this.logger.log(
        `Certificate generated for application ${applicationId}: ${registrationNo}`,
      );

      return {
        id: certificate.id,
        registrationNo: certificate.registrationNo,
        certificateUrl: certificate.certificateUrl,
        issuedAt: certificate.issuedAt,
      };
    } catch (error: any) {
      this.logger.error(
        `Certificate generation failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Generate certificate PDF as Buffer
   * Creates a simple text-based PDF certificate
   */
  private async generateCertificatePdf(
    cooperativeName: string,
    registrationNo: string,
    issuedDate: Date,
  ): Promise<Buffer> {
    try {
      // Create a simple PDF certificate as text
      // In production, you would use a library like pdfkit, puppeteer, or html-pdf
      const certificateContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
/F1 24 Tf
100 750 Td
(CERTIFICATE OF REGISTRATION) Tj
0 -50 Td
/F1 14 Tf
(This is to certify that the cooperative:) Tj
0 -30 Td
/F1 16 Tf
(${cooperativeName}) Tj
0 -30 Td
/F1 12 Tf
(Has been officially registered and recognized by) Tj
0 -20 Td
(Bauchi Cooperative Authority) Tj
0 -30 Td
(Registration Number: ${registrationNo}) Tj
0 -20 Td
(Date of Issue: ${issuedDate.toLocaleDateString()}) Tj
0 -50 Td
(This certificate is valid and recognized.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000243 00000 n
0000000791 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
889
%%EOF
`;

      this.logger.log('Generated certificate PDF buffer');
      return Buffer.from(certificateContent);
    } catch (error: any) {
      this.logger.error(
        `Failed to generate PDF: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Generate unique registration number
   * Format: REG-YYYY-XXXXXX
   */
  private async generateRegistrationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastCertificate = await this.prisma.certificate.findMany({
      where: {
        registrationNo: {
          startsWith: `REG-${year}`,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    let sequenceNumber = 1;
    if (lastCertificate.length > 0) {
      const lastRegNo = lastCertificate[0].registrationNo;
      const matches = lastRegNo.match(/REG-\d+-(\d+)/);
      if (matches) {
        sequenceNumber = parseInt(matches[1]) + 1;
      }
    }

    return `REG-${year}-${sequenceNumber.toString().padStart(6, '0')}`;
  }

  /**
   * Revoke certificate
   */
  async revokeCertificate(
    certificateId: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.prisma.certificate.update({
        where: { id: certificateId },
        data: {
          revokedAt: new Date(),
          revocationReason: reason,
        },
      });

      this.logger.log(`Certificate revoked: ${certificateId}`);
    } catch (error: any) {
      this.logger.error(
        `Certificate revocation failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Verify certificate authenticity
   */
  async verifyCertificate(registrationNo: string): Promise<{
    isValid: boolean;
    registrationNo: string;
    cooperativeName: string;
    issuedAt: Date;
    revokedAt: Date | null;
    certificateUrl: string;
  } | null> {
    try {
      const certificate = await this.prisma.certificate.findUnique({
        where: { registrationNo },
        include: {
          application: true,
        },
      });

      if (!certificate) {
        return null;
      }

      return {
        isValid: !certificate.revokedAt,
        registrationNo: certificate.registrationNo,
        cooperativeName: certificate.application.cooperativeName,
        issuedAt: certificate.issuedAt,
        revokedAt: certificate.revokedAt,
        certificateUrl: certificate.certificateUrl,
      };
    } catch (error: any) {
      this.logger.error(
        `Certificate verification failed: ${error?.message || 'Unknown error'}`,
      );
      return null;
    }
  }
}
