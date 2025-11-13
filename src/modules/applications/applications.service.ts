import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { SubmitApplicationDto } from "./dto/submit-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";

/**
 * Applications Service
 * Handles cooperative application submissions and admin operations
 */
@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger("ApplicationsService");

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submit new cooperative application (public)
   */
  async submitApplication(dto: SubmitApplicationDto): Promise<{
    id: string;
    cooperativeName: string;
    email: string;
    phone: string;
    status: string;
    submittedAt: Date;
  }> {
    // Use transaction to create application and documents atomically
    const application = await this.prisma.$transaction(
      async (tx: PrismaClient) => {
        const app = await tx.application.create({
          data: {
            cooperativeName: dto.cooperativeName,
            email: dto.email,
            phone: dto.phone,
            address: dto.address,
            status: "NEW",
          },
        });

        // Create associated documents if provided
        if (dto.documents && dto.documents.length > 0) {
          await tx.document.createMany({
            data: dto.documents.map((doc) => ({
              applicationId: app.id,
              filename: doc.filename,
              fileUrl: doc.fileUrl,
              documentType: doc.documentType,
            })),
          });
        }

        return app;
      },
    );

    this.logger.log(
      `Application submitted: ${application.id} (${dto.cooperativeName})`
    );

    return {
      id: application.id,
      cooperativeName: application.cooperativeName,
      email: application.email,
      phone: application.phone,
      status: application.status,
      submittedAt: application.submittedAt,
    };
  }

  /**
   * Get all applications (admin)
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
    status?: string
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
    const where = status ? { status } : {};

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
   */
  async updateStatus(
    id: string,
    dto: UpdateApplicationStatusDto,
    reviewedByUserId?: string
  ): Promise<{
    id: string;
    cooperativeName: string;
    status: string;
    reviewedAt: Date | null;
  }> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        reviewedAt: new Date(),
        reviewedBy: reviewedByUserId,
      },
      select: {
        id: true,
        cooperativeName: true,
        status: true,
        reviewedAt: true,
      },
    });

    this.logger.log(`Application ${id} status updated to ${dto.status}`);

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
        this.prisma.application.count({ where: { status: "NEW" } }),
        this.prisma.application.count({ where: { status: "UNDER_REVIEW" } }),
        this.prisma.application.count({ where: { status: "APPROVED" } }),
        this.prisma.application.count({ where: { status: "REJECTED" } }),
        this.prisma.application.count({ where: { status: "FLAGGED" } }),
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
