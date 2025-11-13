import { IsNotEmpty, IsOptional } from "class-validator";

/**
 * DTO for revoking a certificate
 */
export class RevokeCertificateDto {
  @IsNotEmpty()
  revocationReason!: string;

  @IsOptional()
  notes?: string;
}
