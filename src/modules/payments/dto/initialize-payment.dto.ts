import { IsString, IsNumber, IsEmail, IsNotEmpty, Min } from 'class-validator';

export class InitializePaymentDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNumber()
  @Min(1)
  amount!: number; // Amount in naira

  @IsString()
  @IsNotEmpty()
  cooperativeName!: string;
}
