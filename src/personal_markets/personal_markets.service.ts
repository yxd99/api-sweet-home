import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonalMarketDto } from './dto/create-personal_market.dto';
import { UpdatePersonalMarketDto } from './dto/update-personal_market.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalMarket } from './entities/personal_market.entity';
import { Repository } from 'typeorm';
import { HomesService } from 'src/homes/homes.service';

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
    const { name, home_id } = createPersonalMarketDto;

    const home = await this.homeService.getHouseInfo(home_id, email);

    await this.personalMarketRepository.save({
      home,
      name,
    });

    return {
      msg: `${name} added to the home ${home.name}`,
    };
  }

  async findAll(home_id: number, email: string): Promise<PersonalMarket[]> {
    let personalMarkets: PersonalMarket[];
    if (home_id === null) {
      personalMarkets = await this.personalMarketRepository.find({
        relations: ['home', 'home.household_members', 'home.household_members'],
        where: {
          home: {
            household_members: {
              user: {
                email: email,
              },
            },
          },
        },
      });
    } else {
      personalMarkets = await this.personalMarketRepository.find({
        relations: [
          'home',
          'home.household_members',
          'home.household_members.user',
        ],
        where: {
          home: {
            id: home_id,
            household_members: {
              user: {
                email: email,
              },
            },
          },
        },
      });
    }
    return personalMarkets;
  }

  async findOne(
    personalMarketId: number,
    email: string,
  ): Promise<PersonalMarket> {
    await this.validateHome(personalMarketId, email);
    const personalMarket = await this.personalMarketRepository.findOne({
      relations: ['home'],
      where: { id: personalMarketId },
    });

    return personalMarket;
  }

  async update(
    personalMarketId: number,
    updatePersonalMarketDto: UpdatePersonalMarketDto,
    email,
  ) {
    if (Object.keys(updatePersonalMarketDto).length > 0) {
      await this.validateHome(personalMarketId, email);
      const personalMarket = await this.findOne(personalMarketId, email);
      if (Object.keys(updatePersonalMarketDto).includes('home_id')) {
        const { home_id } = updatePersonalMarketDto;
        await this.validateHome(home_id, email);
        personalMarket.home = await this.homeService.getHouseInfo(
          home_id,
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
      const home_id =
        (
          await this.personalMarketRepository.findOne({
            relations: ['home'],
            where: {
              id: personalMarketId,
            },
          })
        )?.home.id || 0;

      await this.homeService.getHouseInfo(home_id, email);
    } catch (e) {
      throw new NotFoundException('Personal market not found for the home');
    }
  }
}
