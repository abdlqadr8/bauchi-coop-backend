import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CertificateGenerationService } from '../certificates/certificate-generation.service';

/**
 * Admin Payment Approval Service
 * Handles admin verification and approval of payments
 * Triggers certificate generation after approval
 */
@Injectable()
export class AdminPaymentApprovalService {
  private readonly logger = new Logger(AdminPaymentApprovalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly certificateService: CertificateGenerationService,
  ) {}

  /**
   * Get all pending payments for admin review
   */
  async getPendingPayments(skip: number = 0, take: number = 10) {
    try {
      const [pending, total] = await Promise.all([
        this.prisma.payment.findMany({
          where: { status: 'COMPLETED' },
          include: {
            application: {
              select: {
                id: true,
                cooperativeName: true,
                email: true,
                createdAt: true,
              },
            },
          },
          orderBy: { paymentDate: 'desc' },
          skip,
          take,
        }),
        this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      ]);

      return {
        data: pending,
        pagination: {
          total,
          skip,
          take,
          hasMore: skip + take < total,
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch pending payments: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get payment details with verification history
   */
  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          application: true,
        },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      return payment;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch payment details: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Approve a payment and generate certificate
   * Integrates with application status workflow
   */
  async approvePayment(
    paymentId: string,
    adminId?: string,
    adminNotes?: string,
  ) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { application: true },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== 'COMPLETED') {
        throw new BadRequestException(
          'Only completed payments can be approved. Current status: ' +
            payment.status,
        );
      }

      // Check if application has already been verified
      const existingCertificate = await this.prisma.certificate.findFirst({
        where: { applicationId: payment.applicationId },
      });

      if (existingCertificate) {
        throw new BadRequestException(
          'Certificate already exists for this application',
        );
      }

      // Update payment status to COMPLETED
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentDate: new Date(),
          updatedAt: new Date(),
        },
        include: { application: true },
      });

      // Update application status to APPROVED using consistent approach
      const updatedApplication = await this.prisma.application.update({
        where: { id: payment.applicationId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: adminId,
          notes: adminNotes || 'Approved after payment verification',
        },
      });

      // Generate certificate
      const certificate = await this.certificateService.generateCertificate(
        payment.applicationId,
      );

      // Send approval email to user with certificate download link
      await this.emailService.sendApplicationApproved(
        updatedApplication.email,
        updatedApplication.cooperativeName,
        certificate.certificateUrl,
        certificate.registrationNo,
      );

      this.logger.log(
        `Payment ${paymentId} approved and application ${payment.applicationId} approved. Certificate: ${certificate.registrationNo}`,
      );

      return {
        payment: updatedPayment,
        application: updatedApplication,
        certificate,
      };
    } catch (error: any) {
      this.logger.error(
        `Payment approval failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Reject a payment
   */
  async rejectPayment(paymentId: string, rejectionReason: string) {
    try {
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        throw new BadRequestException('Rejection reason is required');
      }

      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { application: true },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== 'COMPLETED' && payment.status !== 'PENDING') {
        throw new BadRequestException(
          'Only pending or completed payments can be rejected',
        );
      }

      // Update payment status to FAILED
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          updatedAt: new Date(),
        },
        include: { application: true },
      });

      // Update application status to REJECTED
      await this.prisma.application.update({
        where: { id: payment.applicationId },
        data: {
          status: 'REJECTED',
        },
      });

      // Get the application details to send rejection email
      const application = await this.prisma.application.findUnique({
        where: { id: payment.applicationId },
      });

      // Send rejection email to user
      await this.emailService.sendApplicationRejected(
        application!.email,
        application!.cooperativeName,
        rejectionReason,
      );

      this.logger.log(`Payment ${paymentId} rejected: ${rejectionReason}`);

      return updatedPayment;
    } catch (error: any) {
      this.logger.error(
        `Payment rejection failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get approval statistics
   */
  async getApprovalStats() {
    try {
      const [pending, completed, failed] = await Promise.all([
        this.prisma.payment.count({ where: { status: 'PENDING' } }),
        this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
        this.prisma.payment.count({ where: { status: 'FAILED' } }),
      ]);

      return {
        pending,
        completed,
        failed,
        total: pending + completed + failed,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch approval stats: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }
}
