import { Module } from '@nestjs/common';
import { PersonalMarketsService } from './personal_markets.service';
import { PersonalMarketsController } from './personal_markets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalMarket } from './entities/personal_market.entity';
import { HomesModule } from 'src/homes/homes.module';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalMarket]), HomesModule],
  controllers: [PersonalMarketsController],
  providers: [PersonalMarketsService],
  exports: [PersonalMarketsService],
})
export class PersonalMarketsModule {}
