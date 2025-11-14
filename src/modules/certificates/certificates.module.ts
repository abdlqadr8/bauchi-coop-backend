import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { CertificatesPublicController } from './certificates-public.controller';
import { CertificatesService } from './certificates.service';
import { PrismaModule } from '@/prisma/prisma.module';

/**
 * Certificates Module
 * Handles certificate generation and verification
 */
@Module({
  imports: [PrismaModule],
  controllers: [CertificatesController, CertificatesPublicController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
