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
      user: { userId },
    } = request;

    return this.householdMembersService.addMemberToHome(
      inviteUser.homeId,
      userId,
      inviteUser.userInvited,
    );
  }

  @Delete('delete-member')
  async deleteMember(
    @Req() request,
    @Body() deleteHouseholdMember: DeleteHouseholdMemberDto,
  ) {
    const {
      user: { userId },
    } = request;
    return this.householdMembersService.deleteMember(
      userId,
      deleteHouseholdMember.emailGuest,
      deleteHouseholdMember.homeId,
    );
  }
}
