import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaystackService } from './paystack.service';
import { AdminPaymentApprovalService } from './admin-payment-approval.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { EmailModule } from '@/modules/email/email.module';
import { CertificatesModule } from '@/modules/certificates/certificates.module';

/**
 * Payments Module
 * Handles payment processing and webhooks
 */
@Module({
  imports: [PrismaModule, EmailModule, CertificatesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackService, AdminPaymentApprovalService],
  exports: [PaymentsService, PaystackService, AdminPaymentApprovalService],
})
export class PaymentsModule {}
