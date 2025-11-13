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
import { ApplicationsService } from './applications.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
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
 * Applications Controller
 * Handles public submissions and admin management
 */
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * POST /applications
   * Submit new cooperative application (public)
   */
  @Post()
  async submitApplication(
    @Body() submitApplicationDto: SubmitApplicationDto,
  ): Promise<{
    id: string;
    cooperativeName: string;
    email: string;
    phone: string;
    status: string;
    submittedAt: Date;
  }> {
    return this.applicationsService.submitApplication(submitApplicationDto);
  }

  /**
   * GET /admin/applications
   * List all applications (admin)
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
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
    return this.applicationsService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
      status,
    );
  }

  /**
   * GET /admin/applications/:id
   * Get application by ID with documents (admin)
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async findById(
    @Param('id') id: string,
  ): Promise<{
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
    return this.applicationsService.findById(id);
  }

  /**
   * PATCH /admin/applications/:id/status
   * Update application status (admin)
   */
  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<{
    id: string;
    cooperativeName: string;
    status: string;
    reviewedAt: Date | null;
  }> {
    return this.applicationsService.updateStatus(
      id,
      updateStatusDto,
      req.user?.userId,
    );
  }

  /**
   * GET /admin/applications/stats/overview
   * Get application statistics
   */
  @Get('admin/stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async getStats(): Promise<{
    total: number;
    new: number;
    underReview: number;
    approved: number;
    rejected: number;
    flagged: number;
  }> {
    return this.applicationsService.getStats();
  }
}
