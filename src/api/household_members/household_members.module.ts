import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HomesModule } from '@api/homes/homes.module';
import { UsersModule } from '@api/users/users.module';
import { MailModule } from '@shared/mail/mail.module';

import { HouseholdMember } from './entities/household_member.entity';
import { HouseholdMembersController } from './household_members.controller';
import { HouseholdMembersService } from './household_members.service';

@Module({
  providers: [HouseholdMembersService],
  exports: [HouseholdMembersService],
  imports: [
    TypeOrmModule.forFeature([HouseholdMember]),
    forwardRef(() => HomesModule),
    UsersModule,
    MailModule,
  ],
  controllers: [HouseholdMembersController],
})
export class HouseholdMembersModule {}
