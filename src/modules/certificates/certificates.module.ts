import { Module } from "@nestjs/common";
import { CertificatesController } from "./certificates.controller";
import { CertificatesService } from "./certificates.service";
import { PrismaModule } from "@/prisma/prisma.module";

/**
 * Certificates Module
 * Handles certificate generation and verification
 */
@Module({
  imports: [PrismaModule],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
