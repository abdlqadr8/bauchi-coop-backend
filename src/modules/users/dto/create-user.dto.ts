import { IsEmail, IsNotEmpty, MinLength, IsOptional } from "class-validator";

/**
 * DTO for creating a user
 */
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  role?: string; // Defaults to USER
}
