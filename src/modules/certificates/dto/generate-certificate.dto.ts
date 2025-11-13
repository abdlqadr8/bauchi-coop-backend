import { IsNotEmpty, IsUUID } from "class-validator";

/**
 * DTO for generating a certificate
 */
export class GenerateCertificateDto {
  @IsNotEmpty()
  @IsUUID()
  applicationId!: string;
}
