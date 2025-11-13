import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

/**
 * DTO for webhook payload from payment processor (e.g., Paystack)
 */
export class PaymentWebhookDto {
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  reference!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  applicationId?: string;

  [key: string]: unknown; // Allow additional fields from webhook
}
