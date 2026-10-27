import { IsEmail } from 'class-validator';

export class SendOtpCodeDto {
  @IsEmail()
  email: string;
}

export { SendOtpCodeDto as sendOtpCodeDto };
