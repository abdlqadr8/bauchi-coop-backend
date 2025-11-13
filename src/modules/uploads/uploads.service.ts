import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { PresignUrlDto } from './dto/presign-url.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads Service
 * Generates presigned URLs and stores document metadata
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger('UploadsService');

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generate presigned URL for file upload
   * TODO: Integrate with AWS S3 or similar service for real presigned URLs
   */
  async generatePresignedUrl(
    dto: PresignUrlDto,
    applicationId?: string,
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    fileKey: string;
  }> {
    // Generate unique file key
    const fileKey = `uploads/${uuidv4()}/${dto.filename}`;

    // TODO: Generate real presigned URL from S3
    // const command = new PutObjectCommand({
    //   Bucket: this.configService.get('AWS_S3_BUCKET'),
    //   Key: fileKey,
    //   ContentType: dto.filetype,
    // });
    // const uploadUrl = await getSignedUrl(s3Client, command, {
    //   expiresIn: 3600,
    // });

    // Mock presigned URL (for development)
    const uploadUrl = `https://s3-presigned.mock/${fileKey}?token=mock_token&expires=3600`;
    const fileUrl = `https://s3.mock/${fileKey}`;

    this.logger.log(
      `Presigned URL generated for: ${dto.filename}`,
    );

    return {
      uploadUrl,
      fileUrl,
      fileKey,
    };
  }

  /**
   * Store document metadata after upload
   */
  async storeDocumentMetadata(
    applicationId: string,
    filename: string,
    fileUrl: string,
    documentType: string,
  ): Promise<{ id: string; filename: string; fileUrl: string }> {
    const document = await this.prisma.document.create({
      data: {
        applicationId,
        filename,
        fileUrl,
        documentType,
      },
      select: {
        id: true,
        filename: true,
        fileUrl: true,
      },
    });

    this.logger.log(`Document metadata stored: ${document.id}`);

    return document;
  }
}
