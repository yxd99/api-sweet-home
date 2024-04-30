import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HouseholdMembersService } from '@api/household_members/household_members.service';

import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { Home } from './entities/home.entity';

@Injectable()
export class HomesService {
  constructor(
    @InjectRepository(Home)
    private readonly homeRepository: Repository<Home>,
    @Inject(forwardRef(() => HouseholdMembersService))
    private readonly householdMembersService: HouseholdMembersService,
  ) {}

  async create(
    createHomeDto: CreateHomeDto,
    emailUser: string,
  ): Promise<object> {
    const homeId = (await this.homeRepository.save(createHomeDto)).id;
    await this.householdMembersService.create({
      homeId,
      user_invited: emailUser,
    });
    return {
      msg: `House ${createHomeDto.name} has been create`,
    };
  }

  async findAll(email: string): Promise<object> {
    return this.homeRepository.find({
      relations: ['household_members'],
      where: {
        household_members: {
          user: {
            email,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<Home> {
    const home = await this.homeRepository.findOne({
      relations: ['household_members', 'household_members.user'],
      where: {
        id,
      },
    });
    if (home === null) throw new NotFoundException('Home not found');
    return home;
  }

  async update(homeId: number, updateHomeDto: UpdateHomeDto, email: string) {
    if (Object.keys(updateHomeDto).length === 0)
      throw new BadRequestException('The data to update isnt null');
    const home = await this.getHouseInfo(homeId, email);
    await this.homeRepository.update(homeId, updateHomeDto);
    return {
      msg: `Home ${home.name} has been updated to ${updateHomeDto.name}`,
    };
  }

  async remove(homeId: number, email: string) {
    await this.householdMembersService.verifyIfMemberOfTheHousehold(
      homeId,
      email,
    );
    const home = await this.findOne(homeId);

    await this.homeRepository.softRemove(home);
    return { msg: `${home.name} has been removed successfully` };
  }

  async getHouseInfo(id: number, email: string) {
    const home = await this.homeRepository.findOne({
      relations: ['household_members', 'household_members.user'],
      where: {
        id,
        household_members: {
          user: {
            email,
          },
        },
      },
    });
    if (home === null) throw new NotFoundException('Home not found');
    return home;
  }
}
