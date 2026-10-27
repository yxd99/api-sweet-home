import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendOtpCodeDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario para enviar el código OTP',
  })
  @IsEmail()
  email: string;
}

export { SendOtpCodeDto as sendOtpCodeDto };
