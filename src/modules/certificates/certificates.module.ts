import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { CertificatesPublicController } from './certificates-public.controller';
import { CertificatesService } from './certificates.service';
import { CertificateGenerationService } from './certificate-generation.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { FilesModule } from '@/modules/files/files.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

/**
 * Certificates Module
 * Handles certificate generation and verification
 */
@Module({
  imports: [PrismaModule, FilesModule, ActivityLogsModule],
  controllers: [CertificatesController, CertificatesPublicController],
  providers: [CertificatesService, CertificateGenerationService],
  exports: [CertificatesService, CertificateGenerationService],
})
export class CertificatesModule {}
