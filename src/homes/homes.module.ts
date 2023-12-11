import { Module, forwardRef } from '@nestjs/common';
import { HomesService } from './homes.service';
import { HomesController } from './homes.controller';
import { HouseholdMembersModule } from 'src/household_members/household_members.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Home } from './entities/home.entity';

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
