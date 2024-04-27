import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { apiInfo } from '@common/constants';

const apiInfoSwagger = new DocumentBuilder()
  .setTitle(apiInfo.TITLE)
  .setDescription(apiInfo.DESCRIPTION)
  .setVersion(apiInfo.VERSION)
  .addBearerAuth();

apiInfo.SERVERS.forEach((server) => {
  apiInfoSwagger.addServer(server.host, server.description);
});

export const setup = (app: INestApplication) => {
  const document = SwaggerModule.createDocument(app, apiInfoSwagger.build());
  SwaggerModule.setup(apiInfo.PREFIX, app, document, {
    customSiteTitle: apiInfo.TITLE,
  });
};
