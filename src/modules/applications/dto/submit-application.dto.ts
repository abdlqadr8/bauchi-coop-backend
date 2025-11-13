import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

/**
 * DTO for submitting a cooperative application
 */
export class SubmitApplicationDto {
  @IsNotEmpty()
  cooperativeName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  documents?: Array<{
    filename: string;
    fileUrl: string;
    documentType: string;
  }>;
}
