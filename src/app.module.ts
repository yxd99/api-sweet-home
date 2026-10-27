import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AuthModule } from '@api/auth/auth.module';
import { HomesModule } from '@api/homes/homes.module';
import { HouseholdMembersModule } from '@api/household_members/household_members.module';
import { PersonalMarketsModule } from '@api/personal_markets/personal_markets.module';
import { ProductsModule } from '@api/products/products.module';
import { SupermarketProductsModule } from '@api/supermarket-products/supermarket-products.module';
import { UsersModule } from '@api/users/users.module';
import { typeOrm } from '@common/config';
import { validateEnv } from '@common/config/env.validation';
import { MailModule } from '@shared/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRoot(typeOrm.config()),
    AuthModule,
    UsersModule,
    MailModule,
    HomesModule,
    HouseholdMembersModule,
    PersonalMarketsModule,
    ProductsModule,
    SupermarketProductsModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {
  constructor(private readonly dataSource: DataSource) {}
}
