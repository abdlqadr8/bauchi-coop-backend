import { Controller, Post, Body } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';

/**
 * Applications Public Controller
 * Handles public cooperative application submissions
 */
@Controller('api/v1/applications')
export class ApplicationsPublicController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * POST /api/v1/applications
   * Submit new cooperative application (public)
   */
  @Post()
  async submitApplication(
    @Body() submitApplicationDto: SubmitApplicationDto,
  ): Promise<{
    id: string;
    cooperativeName: string;
    registrationNumber: string | null;
    email: string;
    phone: string;
    address: string;
    status: string;
    submittedAt: Date;
  }> {
    return this.applicationsService.submitApplication(submitApplicationDto);
  }
}
