import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { AppModule } from '@root/app.module';
import { configureApp } from '@root/bootstrap';
import { MailService } from '@shared/mail/mail.service';

import { assertTestDatabase } from './test-db';

/**
 * Captures what the application would have sent by email, so a test can read
 * the one-time code instead of calling the mail provider.
 */
export class MailStub {
  private readonly codes = new Map<string, string>();
  private readonly invitations: Array<{ emailTo: string; hostName: string }> =
    [];

  async sendCode(emailTo: string, code: string): Promise<void> {
    this.codes.set(emailTo, code);
  }

  async inviteUser(emailTo: string, hostName: string): Promise<void> {
    this.invitations.push({ emailTo, hostName });
  }

  codeFor(email: string): string | undefined {
    return this.codes.get(email);
  }

  invitationsFor(emailTo: string) {
    return this.invitations.filter(
      (invitation) => emailTo === invitation.emailTo,
    );
  }

  clear(): void {
    this.codes.clear();
    this.invitations.length = 0;
  }
}

export interface TestContext {
  app: INestApplication;
  http: ReturnType<INestApplication['getHttpServer']>;
  dataSource: DataSource;
  mail: MailStub;
}

/**
 * Boots the real `AppModule` with the production global pipes and prefix, with
 * only the mail transport replaced.
 */
export async function createTestApp(): Promise<TestContext> {
  const mail = new MailStub();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue(mail as unknown as MailService)
    .compile();

  const app = moduleRef.createNestApplication();
  configureApp(app);

  await app.init();

  const dataSource = app.get(DataSource);
  assertTestDatabase(dataSource.options.database);

  return { app, mail, dataSource, http: app.getHttpServer() };
}

/**
 * Empties every table through a single connection, so the foreign key switch
 * and the truncations below happen on the same session.
 */
export async function resetDatabase(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const metadata of dataSource.entityMetadatas) {
      await queryRunner.query(`TRUNCATE TABLE \`${metadata.tableName}\``);
    }
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    await queryRunner.release();
  }
}
