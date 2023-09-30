import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

(async function () {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Api My Home')
    .setDescription('Api develop for the project my-home')
    .setVersion('1')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);
  app.setGlobalPrefix('api');
  await app.listen(port, async () => {
    console.log(`App in: ${await app.getUrl()}`);
  });
})();
