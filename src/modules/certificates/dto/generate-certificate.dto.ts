import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for generating a certificate
 */
export class GenerateCertificateDto {
  @IsNotEmpty()
  @IsString()
  applicationId!: string;
}
