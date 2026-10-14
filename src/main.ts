import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { swagger } from '@common/config';

import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

const main = async () => {
  const port = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  configureApp(app);

  swagger.setup(app);

  await app.listen(port, async () => {
    Logger.log(`App in: ${await app.getUrl()}`);
  });
};

main();
