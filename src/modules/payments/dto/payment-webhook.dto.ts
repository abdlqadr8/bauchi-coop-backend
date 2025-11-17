import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for the data object within Paystack webhook payload
 */
export class PaystackWebhookDataDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  authorization?: any;

  @IsOptional()
  customer?: any;

  [key: string]: unknown; // Allow additional fields
}

/**
 * DTO for webhook payload from Paystack payment processor
 * Accepts the full webhook payload structure from Paystack
 */
export class PaymentWebhookDto {
  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @ValidateNested({ each: false })
  @Type(() => PaystackWebhookDataDto)
  data?: PaystackWebhookDataDto;

  // Allow direct properties for compatibility with different webhook formats
  @IsOptional()
  @IsNumber()
  @Transform(({ obj }) => obj.data?.amount || obj.amount)
  amount?: number;

  @IsOptional()
  @IsString()
  @Transform(({ obj }) => obj.data?.reference || obj.reference)
  reference?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  applicationId?: string;

  [key: string]: unknown; // Allow additional fields from webhook
}
