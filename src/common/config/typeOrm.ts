import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { normalizeEnvironment } from './env.validation';

export function config(): TypeOrmModuleOptions {
  const configService = new ConfigService();
  const environment = normalizeEnvironment(configService.get('ENV'));
  const synchronize = configService.get('DB_SYNCHRONIZE');

  return {
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: Number(configService.get('DB_PORT')),
    database: configService.get('DB_NAME'),
    // schema: 'public',
    // ssl: true,
    // extra: {
    //   ssl: {
    //     rejectUnauthorized: false,
    //   },
    // },
    type: 'mysql',
    // Schema auto-synchronization is explicit: it follows `DB_SYNCHRONIZE`
    // when that variable is set and otherwise stays on for every environment
    // except production.
    synchronize:
      synchronize === undefined
        ? environment !== 'production'
        : String(synchronize).trim().toLowerCase() === 'true',
    entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    autoLoadEntities: true,
    migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  };
}
