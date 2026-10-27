import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { swagger } from '@common/config';
import { AllExceptionsFilter } from '@common/filters/http-exception.filter';

import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

const main = async () => {
  const port = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || true,
      credentials: true,
    },
  });

  app.use(helmet());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  configureApp(app);

  swagger.setup(app);

  await app.listen(port, async () => {
    Logger.log(`App in: ${await app.getUrl()}`);
  });
};

main();
