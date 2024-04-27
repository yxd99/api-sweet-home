import { Body, Controller, Delete, Post, Req } from '@nestjs/common';

import { CreateHouseholdMemberDto } from './dto/create-household_member.dto';
import { DeleteHouseholdMemberDto } from './dto/delete-household_member.dto';
import { HouseholdMembersService } from './household_members.service';

@Controller('household-members')
export class HouseholdMembersController {
  constructor(
    private readonly householdMembersService: HouseholdMembersService,
  ) {}

  @Post('invite-user')
  async addMemberToHome(
    @Body() inviteUser: CreateHouseholdMemberDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;

    return this.householdMembersService.addMemberToHome(
      inviteUser.homeId,
      email,
      inviteUser.user_invited,
    );
  }

  @Delete('delete-member')
  async deleteMember(
    @Req() request,
    @Body() deleteHouseholdMember: DeleteHouseholdMemberDto,
  ) {
    const {
      user: { email },
    } = request;
    return this.householdMembersService.deleteMember(
      email,
      deleteHouseholdMember.email_guest,
      deleteHouseholdMember.homeId,
    );
  }
}
