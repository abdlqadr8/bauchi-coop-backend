import { Module } from '@nestjs/common';
import { ApplicationsAdminController } from './applications.controller';
import { ApplicationsPublicController } from './applications-public.controller';
import { ApplicationsService } from './applications.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { FilesModule } from '@/modules/files/files.module';
import { EmailModule } from '../email/email.module';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Applications Module
 * Handles cooperative registration applications
 */
@Module({
  imports: [PrismaModule, FilesModule, EmailModule, PaymentsModule],
  controllers: [ApplicationsAdminController, ApplicationsPublicController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
