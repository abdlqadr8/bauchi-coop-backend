import { IsNotEmpty, IsString } from "class-validator";

/**
 * DTO for refresh token request
 */
export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
