import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Código OTP de 6 dígitos enviado por correo',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  code: string;
}
