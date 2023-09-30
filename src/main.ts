import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

(async function () {
  const port = process.env.PORT ?? 3000;
  const prefix = process.env.PREFIX ?? 'api';

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Api My Home')
    .setDescription('Api develop for the project my-home')
    .setVersion('1')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  SwaggerModule.setup(prefix, app, swaggerDocument);
  app.setGlobalPrefix(prefix);
  await app.listen(port, async () => {
    console.log(`App in: ${await app.getUrl()}`);
  });
})();
