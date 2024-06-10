import { Body, Controller, Headers, Post } from '@nestjs/common';

import { Public } from '@decorators/index';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { sendOtpCodeDto } from './dto/send-otp.dto';

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

  @Post(`refresh-token`)
  async refreshToken(@Headers(`refresh-token`) token: string): Promise<object> {
    return this.authService.generateRefreshToken(token);
  }

  @Post('disable-tokens')
  async disableAccessToken(
    @Headers('token') accessToken: string,
    @Headers('refresh-token') refreshToken: string,
  ): Promise<object> {
    await this.authService.disableToken(accessToken);
    await this.authService.disableToken(refreshToken);
    return {
      msg: 'tokens has been disables',
    };
  }
}
