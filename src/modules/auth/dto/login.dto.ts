import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

/**
 * DTO for user login
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
