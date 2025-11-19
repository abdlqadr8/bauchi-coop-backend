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
 * Applications Admin Controller
 * Handles admin management of cooperative applications
 */
@Controller('api/v1/admin/applications')
export class ApplicationsAdminController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * GET /api/v1/admin/applications
   * List all applications (admin + staff view)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'STAFF')
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
   * GET /api/v1/admin/applications/:id
   * Get application by ID with documents (admin + staff view)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'STAFF')
  async findById(@Param('id') id: string): Promise<{
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
   * PATCH /api/v1/admin/applications/:id/status
   * Update application status (admin)
   */
  @Patch(':id/status')
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
    reviewedBy: string | null;
  }> {
    return this.applicationsService.updateStatus(
      id,
      updateStatusDto,
      req.user?.userId,
    );
  }

  /**
   * GET /api/v1/admin/applications/stats/overview
   * Get application statistics
   */
  @Get('stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'STAFF')
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
