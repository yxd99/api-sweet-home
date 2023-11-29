import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { sendOtpCodeDto } from './dto/send-otp.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/set-metadata';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  async sendOtp(@Body() body: sendOtpCodeDto): Promise<object> {
    return this.authService.sendCode(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto): Promise<object> {
    return this.authService.validateCode(body);
  }
}
