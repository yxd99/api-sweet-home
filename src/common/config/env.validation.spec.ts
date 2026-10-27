import { Logger } from '@nestjs/common';

import { MINIMUM_SECRET_LENGTH, validateEnv } from './env.validation';

const VALID_CONFIG = {
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_NAME: 'api_sweet_home',
  DB_USER: 'user',
  DB_PASSWORD: 'password',
  JWT_SECRET: 's'.repeat(MINIMUM_SECRET_LENGTH),
  JWT_ACCESS_TOKEN_EXPIRY: '1h',
  JWT_REFRESH_TOKEN_EXPIRY: '30d',
};

describe('validateEnv', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(Logger, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('accepts a complete configuration and defaults ENV to development', () => {
    expect(validateEnv({ ...VALID_CONFIG })).toMatchObject({
      ENV: 'development',
    });
  });

  it('normalizes the legacy `prod` spelling to production', () => {
    expect(
      validateEnv({
        ...VALID_CONFIG,
        ENV: 'prod',
        RESEND_API_KEY: 'k',
        RESEND_MAIL_FROM: 'f',
      }),
    ).toMatchObject({
      ENV: 'production',
    });
  });

  it('rejects an unknown ENV value', () => {
    expect(() => validateEnv({ ...VALID_CONFIG, ENV: 'staging' })).toThrow(
      /ENV must be one of/,
    );
  });

  it('rejects a missing required variable and names it', () => {
    const copy: Record<string, unknown> = { ...VALID_CONFIG };
    delete copy.JWT_SECRET;

    expect(() => validateEnv(copy)).toThrow(/JWT_SECRET is required/);
  });

  it('rejects an empty required variable', () => {
    expect(() => validateEnv({ ...VALID_CONFIG, DB_NAME: '   ' })).toThrow(
      /DB_NAME is required/,
    );
  });

  it('rejects a non-numeric port', () => {
    expect(() =>
      validateEnv({ ...VALID_CONFIG, DB_PORT: 'not-a-port' }),
    ).toThrow(/DB_PORT must be a number/);
  });

  it('warns instead of failing when the secret is weak outside production', () => {
    expect(() =>
      validateEnv({ ...VALID_CONFIG, JWT_SECRET: 'short' }),
    ).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('JWT_SECRET should be at least'),
      'EnvValidation',
    );
  });

  it('fails on a weak secret in production', () => {
    expect(() =>
      validateEnv({
        ...VALID_CONFIG,
        ENV: 'production',
        JWT_SECRET: 'short',
        RESEND_API_KEY: 'key',
        RESEND_MAIL_FROM: 'from',
      }),
    ).toThrow(/JWT_SECRET should be at least/);
  });

  it('requires the mail credentials in production only', () => {
    expect(() => validateEnv({ ...VALID_CONFIG, ENV: 'production' })).toThrow(
      /RESEND_API_KEY is required[\s\S]*RESEND_MAIL_FROM is required/,
    );

    expect(() =>
      validateEnv({ ...VALID_CONFIG, ENV: 'development' }),
    ).not.toThrow();
  });
});
