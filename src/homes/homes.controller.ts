import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { HomesService } from './homes.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { CreateHouseholdMemberDto } from 'src/household_members/dto/create-household_member.dto';

@Controller('homes')
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Post()
  async create(@Body() createHomeDto: CreateHomeDto, @Req() request) {
    const {
      user: { email },
    } = request;

    console.log(email);

    return this.homesService.create(createHomeDto, email);
  }

  @Get()
  findAll(@Req() request) {
    const {
      user: { email },
    } = request;
    return this.homesService.findAll(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request) {
    const {
      user: { email },
    } = request;

    return this.homesService.getHouseInfo(+id, email);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHomeDto: UpdateHomeDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;
    return await this.homesService.update(+id, updateHomeDto, email);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request) {
    const {
      user: { email },
    } = request;
    return await this.homesService.remove(+id, email);
  }

  @Post('invite-user')
  async addMemberToHome(
    @Body() inviteUser: CreateHouseholdMemberDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;

    return await this.homesService.addMemberToHome(
      inviteUser.home_id,
      email,
      inviteUser.user_invited,
    );
  }
}
