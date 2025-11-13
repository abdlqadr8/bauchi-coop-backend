import { IsNotEmpty, IsOptional } from "class-validator";

/**
 * DTO for updating application status (admin)
 */
export class UpdateApplicationStatusDto {
  @IsNotEmpty()
  status!: string; // NEW, UNDER_REVIEW, APPROVED, REJECTED, FLAGGED

  @IsOptional()
  notes?: string;
}
