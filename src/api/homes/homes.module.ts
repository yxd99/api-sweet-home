import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HouseholdMembersModule } from '@api/household_members/household_members.module';
import { UsersModule } from '@api/users/users.module';

import { Home } from './entities/home.entity';
import { HomesController } from './homes.controller';
import { HomesService } from './homes.service';

@Module({
  controllers: [HomesController],
  providers: [HomesService],
  exports: [HomesService],
  imports: [
    TypeOrmModule.forFeature([Home]),
    forwardRef(() => HouseholdMembersModule),
    UsersModule,
  ],
})
export class HomesModule {}
