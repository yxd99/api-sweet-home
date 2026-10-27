import { Logger } from '@nestjs/common';

export type Environment = 'development' | 'test' | 'production';

export const KNOWN_ENVIRONMENTS: Environment[] = [
  'development',
  'test',
  'production',
];

/**
 * The application used to compare the raw `ENV` value against the literal
 * `prod`, so `ENV=production` silently kept schema auto-synchronization on.
 * Both spellings collapse to the same environment here.
 */
export function normalizeEnvironment(value: unknown): Environment {
  const environment = String(value ?? 'development')
    .trim()
    .toLowerCase();

  if (environment === 'production' || environment === 'prod') return 'production';
  if (environment === 'test') return 'test';
  if (environment === 'development' || environment === 'dev' || environment === '')
    return 'development';

  throw new Error(
    `ENV must be one of ${KNOWN_ENVIRONMENTS.join(', ')} (received "${environment}")`,
  );
}

/**
 * Smallest secret length accepted in production. `jsonwebtoken` will sign with
 * anything, so a short secret is a forgeable token rather than a startup error.
 */
export const MINIMUM_SECRET_LENGTH = 32;

const REQUIRED_ALWAYS = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_ACCESS_TOKEN_EXPIRY',
  'JWT_REFRESH_TOKEN_EXPIRY',
];

const REQUIRED_IN_PRODUCTION = ['RESEND_API_KEY', 'RESEND_MAIL_FROM'];

const NUMERIC = ['PORT', 'DB_PORT'];

/**
 * Validates the merged environment before the application starts.
 *
 * A missing variable used to surface much later as a runtime error (a missing
 * `JWT_ACCESS_TOKEN_EXPIRY` only failed on the first `sign()` call), so every
 * required value is checked here and the process refuses to boot when one is
 * absent. A weak secret is fatal in production and a warning elsewhere.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const environment = normalizeEnvironment(config.ENV);
  const errors: string[] = [];

  const required = [
    ...REQUIRED_ALWAYS,
    ...(environment === 'production' ? REQUIRED_IN_PRODUCTION : []),
  ];

  for (const key of required) {
    const value = config[key];

    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push(`${key} is required`);
    }
  }

  for (const key of NUMERIC) {
    const value = config[key];

    if (value !== undefined && value !== '' && Number.isNaN(Number(value))) {
      errors.push(`${key} must be a number (received "${String(value)}")`);
    }
  }

  const secret = typeof config.JWT_SECRET === 'string' ? config.JWT_SECRET : '';
  if (secret.length > 0 && secret.length < MINIMUM_SECRET_LENGTH) {
    const message = `JWT_SECRET should be at least ${MINIMUM_SECRET_LENGTH} characters (received ${secret.length}); generate one with: openssl rand -base64 48`;

    if (environment === 'production') errors.push(message);
    else Logger.warn(message, 'EnvValidation');
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n - ${errors.join('\n - ')}`,
    );
  }

  return { ...config, ENV: environment };
}
