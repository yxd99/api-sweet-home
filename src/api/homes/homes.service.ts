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
      userInvited: emailUser,
    });
    return {
      msg: `House ${createHomeDto.name} has been create`,
    };
  }

  async findAll(email: string): Promise<object> {
    return this.homeRepository.find({
      where: {
        householdMembers: {
          user: {
            email,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<Home> {
    const home = await this.homeRepository.findOne({
      relations: ['householdMembers', `householdMembers.user`],
      where: {
        id,
      },
    });
    if (home === null) {
      throw new NotFoundException('Home not found');
    }
    return home;
  }

  async update(homeId: number, updateHomeDto: UpdateHomeDto, userId: number) {
    if (Object.keys(updateHomeDto).length === 0) {
      throw new BadRequestException('The data to update isnt null');
    }
    const home = await this.getHouseInfo(homeId, userId);
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

  async getHouseInfo(homeId: number, userId: number) {
    const home = await this.homeRepository.findOne({
      relations: ['householdMembers', 'householdMembers.user'],
      where: {
        id: homeId,
        householdMembers: {
          user: {
            id: userId,
          },
        },
      },
    });

    if (home === null) {
      throw new NotFoundException('Home not found');
    }
    return home;
  }
}
