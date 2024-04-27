import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HomesModule } from '@api/homes/homes.module';

import { PersonalMarket } from './entities/personal_market.entity';
import { PersonalMarketsController } from './personal_markets.controller';
import { PersonalMarketsService } from './personal_markets.service';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalMarket]), HomesModule],
  controllers: [PersonalMarketsController],
  providers: [PersonalMarketsService],
  exports: [PersonalMarketsService],
})
export class PersonalMarketsModule {}
