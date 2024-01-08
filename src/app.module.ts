import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { MailModule } from './mail/mail.module';
import { HomesModule } from './homes/homes.module';
import { HouseholdMembersModule } from './household_members/household_members.module';
import { HouseholdMember } from './household_members/entities/household_member.entity';
import { Home } from './homes/entities/home.entity';
import { PersonalMarketsModule } from './personal_markets/personal_markets.module';
import { PersonalMarket } from './personal_markets/entities/personal_market.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      entities: [User, Home, HouseholdMember, PersonalMarket, Product],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    MailModule,
    HomesModule,
    HouseholdMembersModule,
    PersonalMarketsModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private readonly dataSource: DataSource) {}
}
