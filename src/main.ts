import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { swagger } from '@common/config';
import { apiInfo } from '@common/constants';

import { AppModule } from './app.module';

const main = async () => {
  const port = process.env.PORT ?? 3000;
  const prefix = apiInfo.PREFIX;

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  swagger.setup(app);

  app.setGlobalPrefix(prefix);
  await app.listen(port, async () => {
    Logger.log(`App in: ${await app.getUrl()}`);
  });
};

main();
