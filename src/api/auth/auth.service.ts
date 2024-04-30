import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '@api/users/users.service';
import { MailService } from '@shared/mail/mail.service';

import { LoginDto } from './dto/login.dto';
import { sendOtpCodeDto } from './dto/send-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async sendCode({ email }: sendOtpCodeDto): Promise<object> {
    const user = await this.usersService.findByEmail(email);
    if (user === null) {
      user.email = email;
      await this.usersService.create(user);
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
    if (user === null) throw new BadRequestException('Email dont exist');
    const now = new Date();
    const dateExpireCode = new Date(Number(user.code_expire_in.toString()));
    if (dateExpireCode <= now || login.code !== user.code)
      throw new UnauthorizedException('Code no valid or expired');

    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload);
    return { msg: `Welcome ${user.email}`, token };
  }
}
