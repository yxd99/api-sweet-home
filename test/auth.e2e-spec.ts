import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { DataSource } from 'typeorm';

import { MailStub, createTestApp, resetDatabase } from './utils/test-app';

// supertest is a callable CommonJS module while its types describe an ESM
// default export; bind the callable so the compiler and Node agree.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: typeof supertest.default = require('supertest');

const EMAIL = 'e2e-auth@example.com';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mail: MailStub;
  let dataSource: DataSource;
  let http;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    mail = context.mail;
    dataSource = context.dataSource;
    http = context.http;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDatabase(dataSource);
    mail.clear();
  });

  async function requestCode(email = EMAIL): Promise<string> {
    const response = await request(http)
      .post('/api/auth/send-code')
      .send({ email });

    expect(response.status).toBe(201);

    const code = mail.codeFor(email);
    if (!code) throw new Error(`No code was delivered to ${email}`);

    return code;
  }

  async function login(email = EMAIL) {
    const code = await requestCode(email);
    const response = await request(http)
      .post('/api/auth/login')
      .send({ email, code });

    expect(response.status).toBe(201);

    return response;
  }

  describe('POST /api/auth/send-code', () => {
    it('creates the user and delivers the one-time code by email', async () => {
      const response = await request(http)
        .post('/api/auth/send-code')
        .send({ email: EMAIL });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ msg: `code otp sent to email ${EMAIL}` });
      expect(mail.codeFor(EMAIL)).toMatch(/^\d{4}$/);
    });

    it('rejects an invalid email and sends nothing', async () => {
      const response = await request(http)
        .post('/api/auth/send-code')
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(mail.codeFor('not-an-email')).toBeUndefined();
    });

    it('rejects unknown properties', async () => {
      const response = await request(http)
        .post('/api/auth/send-code')
        .send({ email: EMAIL, isAdmin: true });

      expect(response.status).toBe(400);
      expect(mail.codeFor(EMAIL)).toBeUndefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejects a code that does not match', async () => {
      const code = await requestCode();
      const wrongCode = code === '0000' ? '1111' : '0000';

      const response = await request(http)
        .post('/api/auth/login')
        .send({ email: EMAIL, code: wrongCode });

      expect(response.status).toBe(401);
    });

    it('rejects an unknown email', async () => {
      const response = await request(http)
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', code: '1234' });

      expect(response.status).toBe(400);
    });

    it('returns the access and refresh tokens for the delivered code', async () => {
      const response = await login();

      expect(response.body.msg).toBe(`Welcome ${EMAIL}`);
      expect(typeof response.body.token).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
    });
  });

  describe('protected routes', () => {
    it('rejects a request without a bearer token', async () => {
      const response = await request(http).get('/api/homes');

      expect(response.status).toBe(401);
    });

    it('rejects a malformed bearer token', async () => {
      const response = await request(http)
        .get('/api/homes')
        .set('Authorization', 'Bearer not-a-token');

      expect(response.status).toBe(401);
    });

    it('accepts the access token issued by login', async () => {
      const { body } = await login();

      const response = await request(http)
        .get('/api/homes')
        .set('Authorization', `Bearer ${body.token}`);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('issues a refresh token for a valid access token', async () => {
      const { body } = await login();

      const response = await request(http)
        .post('/api/auth/refresh-token')
        .set('refresh-token', body.token);

      expect(response.status).toBe(201);
      expect(typeof response.body.refreshToken).toBe('string');
    });
  });

  describe('POST /api/auth/disable-tokens', () => {
    it('revokes both tokens', async () => {
      const { body } = await login();

      const response = await request(http)
        .post('/api/auth/disable-tokens')
        .set('token', body.token)
        .set('refresh-token', body.refreshToken);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ msg: 'tokens has been disables' });
    });

    it('marks both stored tokens as disabled', async () => {
      const { body } = await login();

      await request(http)
        .post('/api/auth/disable-tokens')
        .set('token', body.token)
        .set('refresh-token', body.refreshToken);

      const rows = await dataSource.query('SELECT isEnable FROM auth');
      expect(rows).toEqual([{ isEnable: 0 }, { isEnable: 0 }]);
    });
  });
});
