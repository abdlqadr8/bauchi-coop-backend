import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for presigned URL request
 */
export class PresignUrlDto {
  @IsNotEmpty()
  @IsString()
  filename!: string;

  @IsNotEmpty()
  @IsString()
  filetype!: string; // MIME type

  @IsNotEmpty()
  @IsString()
  documentType!: string; // e.g., "CONSTITUTION", "AUDIT_REPORT"
}
