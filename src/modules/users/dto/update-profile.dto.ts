import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating current user's profile
 */
export class UpdateProfileDto {
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
