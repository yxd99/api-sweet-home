import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendCode(emailTo, code) {
    await this.mailerService.sendMail({
      to: emailTo,
      subject: `[NO-REPLY] Sweet Home App: Your code is ${code}`,
      template: `./send-code`,
      context: {
        code: code,
      },
    });
  }

  async inviteUser(guest, host, homeName) {
    await this.mailerService.sendMail({
      to: guest,
      subject: `[NO-REPLY] Sweet Home App: Someone invited you to belong to their home`,
      template: './invitation',
      context: {
        guest,
        host,
        homeName,
      },
    });
  }
}
