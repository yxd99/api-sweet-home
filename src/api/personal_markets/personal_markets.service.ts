import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HomesService } from '@api/homes/homes.service';

import { CreatePersonalMarketDto } from './dto/create-personal_market.dto';
import { UpdatePersonalMarketDto } from './dto/update-personal_market.dto';
import { PersonalMarket } from './entities/personal_market.entity';

@Injectable()
export class PersonalMarketsService {
  constructor(
    @InjectRepository(PersonalMarket)
    private readonly personalMarketRepository: Repository<PersonalMarket>,
    private readonly homeService: HomesService,
  ) {}

  async create(
    createPersonalMarketDto: CreatePersonalMarketDto,
    userId: number,
  ) {
    const { name, homeId } = createPersonalMarketDto;

    const home = await this.homeService.getHouseInfo(homeId, userId);

    await this.personalMarketRepository.save({
      home,
      name,
    });

    return {
      msg: `${name} added to the home ${home.name}`,
    };
  }

  async findAll(homeId: number, userId: number): Promise<PersonalMarket[]> {
    await this.homeService.getHouseInfo(homeId, userId);
    return this.personalMarketRepository.find({
      relations: [
        'home',
        'home.householdMembers',
        'home.householdMembers.user',
      ],
      where: {
        home: {
          id: homeId,
          householdMembers: {
            user: {
              id: userId,
            },
          },
        },
      },
    });
  }

  async findOne(
    personalMarketId: number,
    userId: number,
  ): Promise<PersonalMarket> {
    await this.validateHome(personalMarketId, userId);
    return this.personalMarketRepository.findOne({
      relations: ['home'],
      where: { id: personalMarketId },
    });
  }

  async update(
    personalMarketId: number,
    updatePersonalMarketDto: UpdatePersonalMarketDto,
    userId: number,
  ) {
    if (Object.keys(updatePersonalMarketDto).length > 0) {
      await this.validateHome(personalMarketId, userId);
      const personalMarket = await this.findOne(personalMarketId, userId);
      if (Object.keys(updatePersonalMarketDto).includes('homeId')) {
        const { homeId } = updatePersonalMarketDto;
        await this.validateHome(homeId, userId);
        personalMarket.home = await this.homeService.getHouseInfo(
          homeId,
          userId,
        );
      }

      await this.personalMarketRepository.save(personalMarket);
    }
    return {
      msg: `Personal market has been updated`,
    };
  }

  async remove(id: number, userId: number) {
    const market = await this.findOne(id, userId);
    await this.personalMarketRepository.remove(market);
    return { msg: `${market.name} has been delete successfuly` };
  }

  async validateHome(personalMarketId: number, userId: number) {
    const home = await this.personalMarketRepository.findOne({
      relations: ['home'],
      where: {
        id: personalMarketId,
      },
    });
    if (!home) {
      throw new NotFoundException('Personal market not found for the home');
    }

    await this.homeService.getHouseInfo(home.id, userId);
  }
}
