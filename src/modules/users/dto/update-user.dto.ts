import { IsEmail, IsOptional, IsNotEmpty } from "class-validator";

/**
 * DTO for updating user info
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  role?: string;
}
