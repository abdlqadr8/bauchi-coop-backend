import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for submitting a cooperative application
 */
export class SubmitApplicationDto {
  @IsNotEmpty()
  @IsString()
  cooperativeName!: string;

  @IsNotEmpty()
  @IsString()
  registrationNumber!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsString()
  contactPerson!: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber!: string;

  @IsNotEmpty()
  @IsEmail()
  emailAddress!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  documents?: Array<{
    filename: string;
    fileUrl: string;
    documentType: string;
  }>;
}
