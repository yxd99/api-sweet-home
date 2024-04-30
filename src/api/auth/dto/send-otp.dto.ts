import { IsEmail } from 'class-validator';

export class sendOtpCodeDto {
  @IsEmail()
  email: string;
}
