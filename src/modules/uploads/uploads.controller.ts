import { Controller, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { PresignUrlDto } from './dto/presign-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Uploads Controller
 * Handles presigned URLs and document metadata
 */
@Controller('api/v1/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * POST /uploads/presign
   * Generate presigned URL for file upload
   */
  @Post('presign')
  async generatePresignedUrl(
    @Body() presignUrlDto: PresignUrlDto,
    @Query('applicationId') applicationId?: string,
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    fileKey: string;
  }> {
    return this.uploadsService.generatePresignedUrl(
      presignUrlDto,
      applicationId,
    );
  }

  /**
   * POST /uploads/documents/metadata
   * Store document metadata after upload (requires auth)
   */
  @Post('documents/metadata')
  @UseGuards(JwtAuthGuard)
  async storeDocumentMetadata(
    @Body()
    {
      applicationId,
      filename,
      fileUrl,
      documentType,
    }: {
      applicationId: string;
      filename: string;
      fileUrl: string;
      documentType: string;
    },
    @Req() req: RequestWithUser,
  ): Promise<{ id: string; filename: string; fileUrl: string }> {
    return this.uploadsService.storeDocumentMetadata(
      applicationId,
      filename,
      fileUrl,
      documentType,
    );
  }
}
