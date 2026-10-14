import { INestApplication, ValidationPipe } from '@nestjs/common';

import { apiInfo } from '@common/constants';

/**
 * Applies the runtime configuration that every entry point must share.
 *
 * `main.ts` boots the HTTP server and the end-to-end harness creates an
 * in-memory instance; both call this function so the global pipe, the route
 * prefix and the validation rules under test are the ones that run in
 * production.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix(apiInfo.PREFIX);

  return app;
}
