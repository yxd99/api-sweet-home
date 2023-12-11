import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateHouseholdMemberDto } from './dto/create-household_member.dto';
import { UpdateHouseholdMemberDto } from './dto/update-household_member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HouseholdMember } from './entities/household_member.entity';
import { Repository } from 'typeorm';
import { HomesService } from 'src/homes/homes.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class HouseholdMembersService {
  constructor(
    @InjectRepository(HouseholdMember)
    private readonly householdMemberRepository: Repository<HouseholdMember>,
    @Inject(forwardRef(() => HomesService))
    private readonly homeService: HomesService,
    private readonly userService: UsersService,
  ) {}

  async create(createHouseholdMemberDto: CreateHouseholdMemberDto) {
    const user = await this.userService.findByEmail(
      createHouseholdMemberDto.user_invited,
    );
    const home = await this.homeService.findOne(
      createHouseholdMemberDto.home_id,
      user.email,
    );
    const newMember = await this.householdMemberRepository.create({
      home,
      user,
    });
    await this.householdMemberRepository.save(newMember);
    return {
      msg: `User ${user.email} added to the home`,
    };
  }

  findAll() {
    return `This action returns all householdMembers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} householdMember`;
  }

  update(id: number, updateHouseholdMemberDto: UpdateHouseholdMemberDto) {
    return `This action updates a #${id}, ${updateHouseholdMemberDto.home_id} householdMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} householdMember`;
  }
}
