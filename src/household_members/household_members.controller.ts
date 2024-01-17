import { Body, Controller, Delete, Post, Req } from '@nestjs/common';
import { CreateHouseholdMemberDto } from './dto/create-household_member.dto';
import { HouseholdMembersService } from './household_members.service';
import { DeleteHouseholdMemberDto } from './dto/delete-household_member.dto';

@Controller('household-members')
export class HouseholdMembersController {
  constructor(
    private readonly householdMembersService: HouseholdMembersService,
  ) {}

  @Post('invite-user')
  async addMemberToHome(
    @Body() inviteUser: CreateHouseholdMemberDto,
    @Req() { user: { email } },
  ) {
    return await this.householdMembersService.addMemberToHome(
      inviteUser.home_id,
      email,
      inviteUser.user_invited,
    );
  }

  @Delete('delete-member')
  async deleteMember(
    @Body() deleteHouseholdMember: DeleteHouseholdMemberDto,
    @Req() { user: { email } },
  ) {
    return await this.householdMembersService.deleteMember(
      email,
      deleteHouseholdMember.email_guest,
      deleteHouseholdMember.home_id,
    );
  }
}
