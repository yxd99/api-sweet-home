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
    email: string,
  ) {
    const { name, homeId } = createPersonalMarketDto;

    const home = await this.homeService.getHouseInfo(homeId, email);

    await this.personalMarketRepository.save({
      home,
      name,
    });

    return {
      msg: `${name} added to the home ${home.name}`,
    };
  }

  async findAll(homeId: number, email: string): Promise<PersonalMarket[]> {
    await this.homeService.getHouseInfo(homeId, email);
    return this.personalMarketRepository.find({
      relations: [
        'home',
        'home.household_members',
        'home.household_members.user',
      ],
      where: {
        home: {
          id: homeId,
          household_members: {
            user: {
              email,
            },
          },
        },
      },
    });
  }

  async findOne(
    personalMarketId: number,
    email: string,
  ): Promise<PersonalMarket> {
    await this.validateHome(personalMarketId, email);
    return this.personalMarketRepository.findOne({
      relations: ['home'],
      where: { id: personalMarketId },
    });
  }

  async update(
    personalMarketId: number,
    updatePersonalMarketDto: UpdatePersonalMarketDto,
    email,
  ) {
    if (Object.keys(updatePersonalMarketDto).length > 0) {
      await this.validateHome(personalMarketId, email);
      const personalMarket = await this.findOne(personalMarketId, email);
      if (Object.keys(updatePersonalMarketDto).includes('homeId')) {
        const { homeId } = updatePersonalMarketDto;
        await this.validateHome(homeId, email);
        personalMarket.home = await this.homeService.getHouseInfo(
          homeId,
          email,
        );
      }

      await this.personalMarketRepository.save(personalMarket);
    }
    return {
      msg: `Personal market has been updated`,
    };
  }

  async remove(id: number, email: string) {
    const market = await this.findOne(id, email);
    await this.personalMarketRepository.remove(market);
    return { msg: `${market.name} has been delete successfuly` };
  }

  async validateHome(personalMarketId: number, email: string) {
    try {
      const homeId =
        (
          await this.personalMarketRepository.findOne({
            relations: ['home'],
            where: {
              id: personalMarketId,
            },
          })
        )?.home.id || 0;

      await this.homeService.getHouseInfo(homeId, email);
    } catch (e) {
      throw new NotFoundException('Personal market not found for the home');
    }
  }
}
