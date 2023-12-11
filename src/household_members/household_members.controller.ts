import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HouseholdMembersService } from './household_members.service';
import { CreateHouseholdMemberDto } from './dto/create-household_member.dto';
import { UpdateHouseholdMemberDto } from './dto/update-household_member.dto';

@Controller('household-members')
export class HouseholdMembersController {
  constructor(private readonly householdMembersService: HouseholdMembersService) {}

  @Post()
  create(@Body() createHouseholdMemberDto: CreateHouseholdMemberDto) {
    return this.householdMembersService.create(createHouseholdMemberDto);
  }

  @Get()
  findAll() {
    return this.householdMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.householdMembersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHouseholdMemberDto: UpdateHouseholdMemberDto) {
    return this.householdMembersService.update(+id, updateHouseholdMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.householdMembersService.remove(+id);
  }
}
