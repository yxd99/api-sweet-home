import { config as typeOrmConfig } from './typeOrm';

const TOUCHED_KEYS = ['ENV', 'DB_SYNCHRONIZE'];

describe('typeOrm config', () => {
  const original = new Map<string, string | undefined>();

  beforeAll(() => {
    for (const key of TOUCHED_KEYS) {
      original.set(key, process.env[key]);
      delete process.env[key];
    }
  });

  afterAll(() => {
    for (const key of TOUCHED_KEYS) {
      const value = original.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('keeps schema synchronization on outside production', () => {
    delete process.env.ENV;

    expect(typeOrmConfig().synchronize).toBe(true);
  });

  it('keeps it on for the test environment', () => {
    process.env.ENV = 'test';

    expect(typeOrmConfig().synchronize).toBe(true);
  });

  it('turns it off for ENV=production', () => {
    process.env.ENV = 'production';

    expect(typeOrmConfig().synchronize).toBe(false);
  });

  it('turns it off for the legacy ENV=prod spelling', () => {
    process.env.ENV = 'prod';

    expect(typeOrmConfig().synchronize).toBe(false);
  });

  it('follows an explicit DB_SYNCHRONIZE=true even in production', () => {
    process.env.ENV = 'production';
    process.env.DB_SYNCHRONIZE = 'true';

    expect(typeOrmConfig().synchronize).toBe(true);
  });

  it('follows an explicit DB_SYNCHRONIZE=false in development', () => {
    process.env.ENV = 'development';
    process.env.DB_SYNCHRONIZE = 'false';

    expect(typeOrmConfig().synchronize).toBe(false);
  });

  it('rejects an unknown ENV value instead of guessing', () => {
    process.env.ENV = 'staging';

    expect(() => typeOrmConfig()).toThrow(/ENV must be one of/);
  });
});
