import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CloudinaryService } from '@/modules/files/cloudinary.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { EmailService } from '../email/email.service';
import { AdminPaymentApprovalService } from '../payments/admin-payment-approval.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

/**
 * Applications Service
 * Handles cooperative application submissions and admin operations
 */
@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger('ApplicationsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly emailService: EmailService,
    private readonly approvalService: AdminPaymentApprovalService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Submit new cooperative application (public)
   */
  async submitApplication(dto: SubmitApplicationDto): Promise<{
    id: string;
    cooperativeName: string;
    registrationNumber: string | null;
    email: string;
    phone: string;
    address: string;
    status: string;
    submittedAt: Date;
  }> {
    try {
      // Use transaction to create application and documents atomically
      const application = (await this.prisma.$transaction(async (tx: any) => {
        const app = await tx.application.create({
          data: {
            cooperativeName: dto.cooperativeName,
            registrationNumber: dto.registrationNumber,
            email: dto.emailAddress,
            phone: dto.phoneNumber,
            address: dto.address,
            status: 'NEW',
          },
        });

        // Upload documents to Cloudinary if provided
        if (dto.documents && dto.documents.length > 0) {
          const uploadedDocuments = [];

          for (const doc of dto.documents) {
            try {
              // Convert Base64 data to Buffer
              const fileBuffer = Buffer.from(doc.data, 'base64');

              // Upload to Cloudinary with correct folder structure
              const uploadResult = await this.cloudinaryService.uploadFile(
                fileBuffer,
                doc.filename,
                `bauchi_coops_documents/${app.id}`,
                'application/pdf',
              );

              uploadedDocuments.push({
                applicationId: app.id,
                filename: doc.filename,
                fileUrl: uploadResult.url,
                documentType: doc.documentType,
              });
            } catch (error: any) {
              this.logger.error(
                `Failed to upload document ${doc.filename}: ${error?.message}`,
              );
              throw error;
            }
          }

          // Create document records with Cloudinary URLs
          if (uploadedDocuments.length > 0) {
            await tx.document.createMany({
              data: uploadedDocuments,
            });
          }
        }

        return app;
      })) as any;

      // Send success email to user
      await this.emailService.sendRegistrationConfirmation(
        application.email,
        application.cooperativeName,
        application.id,
      );

      this.logger.log(
        `Application submitted: ${application.id} (${dto.cooperativeName})`,
      );

      // Log activity
      await this.activityLogsService.logActivity({
        applicationId: application.id,
        action: 'SUBMIT_APPLICATION',
        description: `New application submitted: ${dto.cooperativeName}`,
        metadata: {
          email: application.email,
          phone: application.phone,
          documentsCount: dto.documents?.length || 0,
        },
      });

      return {
        id: application.id,
        cooperativeName: application.cooperativeName,
        registrationNumber: application.registrationNumber,
        email: application.email,
        phone: application.phone,
        address: application.address,
        status: application.status,
        submittedAt: application.submittedAt,
      };
    } catch (error: any) {
      this.logger.error(
        `Application submission failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get all applications (admin)
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
    status?: string,
  ): Promise<{
    applications: Array<{
      id: string;
      cooperativeName: string;
      email: string;
      phone: string;
      status: string;
      submittedAt: Date;
      reviewedAt: Date | null;
    }>;
    total: number;
  }> {
    const where = status ? { status: status as any } : {};

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          cooperativeName: true,
          email: true,
          phone: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { applications, total };
  }

  /**
   * Get application by ID with documents
   */
  async findById(id: string): Promise<{
    id: string;
    cooperativeName: string;
    registrationNumber: string | null;
    email: string;
    phone: string;
    address: string | null;
    status: string;
    submittedAt: Date;
    reviewedAt: Date | null;
    reviewedBy: string | null;
    notes: string | null;
    documents: Array<{
      id: string;
      filename: string;
      fileUrl: string;
      documentType: string;
      uploadedAt: Date;
    }>;
  } | null> {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        documents: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
            documentType: true,
            uploadedAt: true,
          },
        },
      },
    });
  }

  /**
   * Update application status (admin)
   * Handles status transitions: NEW → UNDER_REVIEW → APPROVED/REJECTED/FLAGGED
   * When approving, triggers certificate generation via AdminPaymentApprovalService.approvePayment()
   * When rejecting, triggers rejection workflow via AdminPaymentApprovalService.rejectPayment()
   * When flagging, logs the flag for manual review
   */
  async updateStatus(
    id: string,
    dto: UpdateApplicationStatusDto,
    reviewedByUserId?: string,
  ): Promise<{
    id: string;
    cooperativeName: string;
    status: string;
    reviewedAt: Date | null;
    reviewedBy: string | null;
  }> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    // Validate status transition
    const validStatuses = [
      'NEW',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'FLAGGED',
    ];
    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException(`Invalid status: ${dto.status}`);
    }

    // Update application status in database
    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: dto.status as any,
        notes: dto.notes,
        reviewedAt: new Date(),
        reviewedBy: reviewedByUserId,
      },
      select: {
        id: true,
        cooperativeName: true,
        status: true,
        reviewedAt: true,
        reviewedBy: true,
      },
    });

    // Handle APPROVED status: Find associated payment and approve it
    if (dto.status === 'APPROVED') {
      const payment = await this.prisma.payment.findFirst({
        where: { applicationId: id },
        orderBy: { createdAt: 'desc' },
      });

      if (payment && payment.status === 'COMPLETED') {
        try {
          // Use AdminPaymentApprovalService to approve payment and generate certificate
          await this.approvalService.approvePayment(
            payment.id,
            reviewedByUserId,
            dto.notes || 'Application approved by admin',
          );
          this.logger.log(
            `Approval triggered for application ${id} via payment ${payment.id}`,
          );
        } catch (error: any) {
          this.logger.warn(
            `Certificate generation skipped for ${id}: ${error?.message}`,
          );
          // Don't fail the status update if certificate generation fails
        }
      } else if (!payment) {
        this.logger.warn(
          `No completed payment found for application ${id}. Approval status set but certificate generation skipped.`,
        );
      } else {
        this.logger.warn(
          `Payment status is ${payment.status}, not COMPLETED. Certificate generation skipped for ${id}.`,
        );
      }
    }

    // Handle REJECTED status: Find associated payment and reject it
    if (dto.status === 'REJECTED') {
      const payment = await this.prisma.payment.findFirst({
        where: { applicationId: id },
        orderBy: { createdAt: 'desc' },
      });

      if (payment) {
        try {
          const rejectionReason =
            dto.notes ||
            'Your application has been rejected. Please contact support for details.';

          // Use AdminPaymentApprovalService to reject payment and send email
          await this.approvalService.rejectPayment(payment.id, rejectionReason);
          this.logger.log(
            `Rejection triggered for application ${id} via payment ${payment.id}`,
          );
        } catch (error: any) {
          this.logger.warn(
            `Rejection workflow failed for ${id}: ${error?.message}`,
          );
          // Attempt direct email as fallback
          try {
            await this.emailService.sendApplicationRejected(
              application.email,
              application.cooperativeName,
              dto.notes ||
                'Your application has been rejected. Please contact support for details.',
            );
          } catch (emailError: any) {
            this.logger.error(
              `Failed to send rejection email for ${id}: ${emailError?.message}`,
            );
          }
        }
      } else {
        // No payment found - just send rejection email
        try {
          await this.emailService.sendApplicationRejected(
            application.email,
            application.cooperativeName,
            dto.notes ||
              'Your application has been rejected. Please contact support for details.',
          );
          this.logger.log(
            `Rejection email sent to ${application.email} for application ${id}`,
          );
        } catch (error: any) {
          this.logger.warn(
            `Failed to send rejection email for ${id}: ${error?.message}`,
          );
        }
      }
    }

    // Handle FLAGGED status: Log the flag for manual review
    if (dto.status === 'FLAGGED') {
      this.logger.warn(
        `Application ${id} flagged for review by ${reviewedByUserId || 'system'}: ${dto.notes || 'No reason provided'}`,
      );
    }

    this.logger.log(
      `Application ${id} status updated to ${dto.status} by ${reviewedByUserId || 'system'}`,
    );

    // Log activity
    await this.activityLogsService.logActivity({
      userId: reviewedByUserId,
      applicationId: id,
      action: 'UPDATE_APPLICATION_STATUS',
      description: `Changed application ${application.cooperativeName} status from ${application.status} to ${dto.status}`,
      metadata: {
        previousStatus: application.status,
        newStatus: dto.status,
        notes: dto.notes,
      },
    });

    return updated;
  }

  /**
   * Get application statistics
   */
  async getStats(): Promise<{
    total: number;
    new: number;
    underReview: number;
    approved: number;
    rejected: number;
    flagged: number;
  }> {
    const [total, newCount, underReview, approved, rejected, flagged] =
      await Promise.all([
        this.prisma.application.count(),
        this.prisma.application.count({ where: { status: 'NEW' as any } }),
        this.prisma.application.count({
          where: { status: 'UNDER_REVIEW' as any },
        }),
        this.prisma.application.count({ where: { status: 'APPROVED' as any } }),
        this.prisma.application.count({ where: { status: 'REJECTED' as any } }),
        this.prisma.application.count({ where: { status: 'FLAGGED' as any } }),
      ]);

    return {
      total,
      new: newCount,
      underReview,
      approved,
      rejected,
      flagged,
    };
  }
}
