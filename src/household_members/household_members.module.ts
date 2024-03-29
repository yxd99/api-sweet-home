import { Module, forwardRef } from '@nestjs/common';
import { HouseholdMembersService } from './household_members.service';
import { HomesModule } from 'src/homes/homes.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseholdMember } from './entities/household_member.entity';
import { HouseholdMembersController } from './household_members.controller';
import { MailModule } from 'src/mail/mail.module';

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
