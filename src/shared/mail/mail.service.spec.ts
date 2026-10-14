import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailService } from './mail.service';

jest.mock('resend', () => ({ Resend: jest.fn() }));

const MockResend = Resend as unknown as jest.Mock;

const FROM = 'Sweet Home <no-reply@example.com>';
const SUBJECT_CODE = '[NO-REPLY] Sweet Home App: Your code is 4831';
const SUBJECT_INVITATION =
  '[NO-REPLY] Sweet Home App: Someone invited you to belong to their home';
const PROVIDER_CAUSE = 'Invalid from address';

const configWith = (overrides: Record<string, string | undefined> = {}) =>
  ({
    get: (key: string): string | undefined =>
      ({
        RESEND_API_KEY: 're_test_api_key',
        RESEND_MAIL_FROM: FROM,
        ...overrides,
      })[key],
  }) as unknown as ConfigService;

const rejected = () => ({
  data: null,
  error: { name: 'validation_error', statusCode: 422, message: PROVIDER_CAUSE },
  headers: null,
});

describe('MailService', () => {
  let send: jest.Mock;

  beforeEach(() => {
    send = jest.fn();
    MockResend.mockImplementation(() => ({ emails: { send } }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the verification code with the code interpolated into the HTML', async () => {
    send.mockResolvedValue({ data: { id: 'mail_1' }, error: null, headers: {} });

    await new MailService(configWith()).sendCode('someone@example.com', '4831');

    expect(send).toHaveBeenCalledTimes(1);
    const payload = send.mock.calls[0][0];
    expect(payload.from).toBe(FROM);
    expect(payload.to).toBe('someone@example.com');
    expect(payload.subject).toBe(SUBJECT_CODE);
    expect(payload.html).toContain('4831');
    expect(payload.html).not.toContain('{{');
  });

  it('sends the invitation with the host and home name interpolated into the HTML', async () => {
    send.mockResolvedValue({ data: { id: 'mail_2' }, error: null, headers: {} });

    await new MailService(configWith()).inviteUser(
      'guest@example.com',
      'host@example.com',
      'La Casa',
    );

    expect(send).toHaveBeenCalledTimes(1);
    const payload = send.mock.calls[0][0];
    expect(payload.from).toBe(FROM);
    expect(payload.to).toBe('guest@example.com');
    expect(payload.subject).toBe(SUBJECT_INVITATION);
    expect(payload.html).toContain('host@example.com');
    expect(payload.html).toContain('La Casa');
    expect(payload.html).not.toContain('{{');
  });

  it('throws when Resend reports an error, so a failed send is never a silent success', async () => {
    send.mockResolvedValue(rejected());

    await expect(
      new MailService(configWith()).sendCode('someone@example.com', '4831'),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('logs the provider cause and keeps it out of the client-facing body', async () => {
    const logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    send.mockResolvedValue(rejected());

    const error = await new MailService(configWith())
      .sendCode('someone@example.com', '4831')
      .catch((rejection) => rejection);

    expect(error).toBeInstanceOf(InternalServerErrorException);
    expect(error.getResponse()).toEqual({
      message: 'Internal Server Error',
      statusCode: 500,
    });
    expect(JSON.stringify(error.getResponse())).not.toContain(PROVIDER_CAUSE);
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining(PROVIDER_CAUSE),
    );
  });

  it.each(['RESEND_API_KEY', 'RESEND_MAIL_FROM'])(
    'fails on the generic error, without calling Resend, when %s is missing',
    async (missing) => {
      const logError = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);

      const error = await new MailService(configWith({ [missing]: undefined }))
        .sendCode('someone@example.com', '4831')
        .catch((rejection) => rejection);

      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.getResponse()).toEqual({
        message: 'Internal Server Error',
        statusCode: 500,
      });
      expect(send).not.toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(expect.stringContaining(missing));
    },
  );
});
