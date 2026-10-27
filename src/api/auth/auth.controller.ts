import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '@decorators/index';

import { AuthService } from './auth.service';
import { DisableTokensHeaders } from './dto/disable-tokens-headers.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenHeaders } from './dto/refresh-token-headers.decorator';
import { sendOtpCodeDto } from './dto/send-otp.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('send-code')
  async sendOtp(@Body() body: sendOtpCodeDto): Promise<object> {
    return this.authService.sendCode(body);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: LoginDto): Promise<object> {
    return this.authService.validateCode(body);
  }

  @Post('refresh-token')
  async refreshToken(@RefreshTokenHeaders() token: string): Promise<object> {
    return this.authService.generateRefreshToken(token);
  }

  @Post('disable-tokens')
  async disableAccessToken(
    @DisableTokensHeaders() headers: { token: string; 'refresh-token': string },
  ): Promise<object> {
    await this.authService.disableToken(headers.token);
    await this.authService.disableToken(headers['refresh-token']);
    return {
      msg: 'tokens has been disables',
    };
  }
}
