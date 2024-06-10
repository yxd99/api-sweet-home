import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from '@api/users/users.service';
import { MailService } from '@shared/mail/mail.service';

import { LoginDto } from './dto/login.dto';
import { sendOtpCodeDto } from './dto/send-otp.dto';
import { Auth, TOKEN_TYPE } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async sendCode({ email }: sendOtpCodeDto): Promise<object> {
    const user = await this.usersService.findByEmail(email);
    if (user === null) {
      await this.usersService.create({
        email,
      });
    } else {
      await this.usersService.updateCode(email);
    }
    const { code } = await this.usersService.getCodeAndExpiring(email);
    await this.mailService.sendCode(email, code);

    return {
      msg: `code otp sent to email ${email}`,
    };
  }

  async validateCode(login: LoginDto): Promise<object> {
    const user = await this.usersService.getCodeAndExpiring(login.email);

    if (user === null) {
      throw new BadRequestException('Email dont exist');
    }

    const now = new Date();
    const dateExpireCode = new Date(Number(user.codeExpireIn.toString()));
    if (dateExpireCode <= now || login.code !== user.code) {
      throw new UnauthorizedException('Code no valid or expired');
    }

    const payload = {
      userId: user.id,
    };
    const tokenGenerated = await this.jwtService.signAsync(payload);
    await this.authRepository.save({
      isEnable: true,
      token: tokenGenerated,
      tokenType: TOKEN_TYPE.ACCESS_TOKEN,
      user,
    });
    const { refreshToken } = await this.generateRefreshToken(tokenGenerated);
    return {
      msg: `Welcome ${user.email}`,
      token: tokenGenerated,
      refreshToken,
    };
  }

  async generateRefreshToken(accessToken: string) {
    const tokenData = await this.authRepository.findOne({
      relations: ['user'],
      where: {
        token: accessToken,
        tokenType: TOKEN_TYPE.ACCESS_TOKEN,
        isEnable: true,
      },
    });

    if (!tokenData) {
      return {
        msg: 'Token no valid',
      };
    }
    const user = await this.usersService.findByEmail(tokenData.user.email);
    const payload = {
      userId: user.id,
    };
    const tokenGenerated = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRY'),
    });
    await this.authRepository.save({
      token: tokenGenerated,
      tokenType: TOKEN_TYPE.REFRESH_TOKEN,
      user,
    });
    return { refreshToken: tokenGenerated };
  }

  async refreshCurrentRefreshToken(refreshToken: string) {
    try {
      await this.jwtService.verify(refreshToken);
    } catch (error) {
      return {
        error,
      };
    }
    const tokenData = await this.authRepository.findOneBy({
      token: refreshToken,
      tokenType: TOKEN_TYPE.REFRESH_TOKEN,
      isEnable: true,
    });

    if (!tokenData) {
      return {
        msg: 'Token no valid',
      };
    }
    await this.disableToken(tokenData.token);
    const user = await this.usersService.findByEmail(tokenData.user.email);
    const payload = {
      userId: user.id,
    };
    const tokenGenerated = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRY'),
    });
    await this.authRepository.save({
      token: tokenGenerated,
      tokenType: TOKEN_TYPE.REFRESH_TOKEN,
      user,
    });
    return { refreshToken: tokenGenerated };
  }

  async disableToken(token: string) {
    const tokenData = await this.authRepository.findOneBy({
      token,
    });
    if (!tokenData) {
      return {
        msg: 'Token not found',
      };
    }
    await this.authRepository.update(tokenData.id, {
      isEnable: false,
    });

    return {
      msg: 'The token has disabled',
    };
  }
}
