import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

/**
 * DTO for creating a user
 */
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string; // Optional - will be auto-generated if not provided

  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  role?: string; // Defaults to USER
}
