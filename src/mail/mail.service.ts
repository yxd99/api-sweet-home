import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { Resend } from 'resend';

const TEMPLATES_DIRECTORY = join(__dirname, 'templates');

interface Mail {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private client: Resend | null = null;

  constructor(private readonly configService: ConfigService) {}

  async sendCode(emailTo: string, code: string): Promise<void> {
    await this.send({
      to: emailTo,
      subject: `[NO-REPLY] Sweet Home App: Your code is ${code}`,
      template: 'send-code',
      context: { code },
    });
  }

  async inviteUser(
    guest: string,
    host: string,
    homeName: string,
  ): Promise<void> {
    await this.send({
      to: guest,
      subject:
        '[NO-REPLY] Sweet Home App: Someone invited you to belong to their home',
      template: 'invitation',
      context: { guest, host, homeName },
    });
  }

  private async send({ to, subject, template, context }: Mail): Promise<void> {
    const { error } = await this.resend().emails.send({
      from: this.sender(),
      to,
      subject,
      html: this.render(template, context),
    });

    // The Resend SDK reports failures in `error` instead of throwing, so without
    // this check a rejected message would look like a successful send.
    if (error) {
      throw this.fail(`Resend rejected the email to ${to}: ${error.message}`);
    }
  }

  private render(template: string, context: Record<string, unknown>): string {
    const source = readFileSync(
      join(TEMPLATES_DIRECTORY, `${template}.hbs`),
      'utf8',
    );

    return handlebars.compile(source, { strict: true })(context);
  }

  private sender(): string {
    const from = this.configService.get<string>('RESEND_MAIL_FROM');

    if (!from) {
      throw this.fail(
        'RESEND_MAIL_FROM is not set: Resend requires a verified sender address',
      );
    }

    return from;
  }

  private resend(): Resend {
    if (this.client === null) {
      const apiKey = this.configService.get<string>('RESEND_API_KEY');

      if (!apiKey) {
        throw this.fail(
          'RESEND_API_KEY is not set: cannot send emails through Resend',
        );
      }

      this.client = new Resend(apiKey);
    }

    return this.client;
  }

  // The cause is logged for the developer, while the caller keeps the generic
  // internal error the SMTP transport used to produce. Provider errors are not
  // part of this API's contract.
  private fail(cause: string): InternalServerErrorException {
    this.logger.error(cause);

    return new InternalServerErrorException();
  }
}
