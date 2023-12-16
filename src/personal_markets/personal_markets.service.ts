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
    userEmail: string,
  ) {
    const { name, home_id } = createPersonalMarketDto;

    const home = await this.homeService.getHouseInfo(home_id, userEmail);

    await this.personalMarketRepository.save({
      home,
      name,
    });

    return {
      msg: `${name} added to the home ${home.name}`,
    };
  }

  async findAll(homeId: number, userEmail: string): Promise<PersonalMarket[]> {
    await this.homeService.getHouseInfo(homeId, userEmail);
    const personalMarkets = await this.personalMarketRepository.find({
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
              email: userEmail,
            },
          },
        },
      },
    });
    return personalMarkets;
  }

  async findOne(
    personalMarketId: number,
    userEmail: string,
  ): Promise<PersonalMarket> {
    await this.validateHome(personalMarketId, userEmail);
    const personalMarket = await this.personalMarketRepository.findOne({
      relations: ['home'],
      where: { id: personalMarketId },
    });

    return personalMarket;
  }

  async update(
    personalMarketId: number,
    updatePersonalMarketDto: UpdatePersonalMarketDto,
    userEmail,
  ) {
    if (Object.keys(updatePersonalMarketDto).length > 0) {
      await this.validateHome(personalMarketId, userEmail);
      const personalMarket = await this.findOne(personalMarketId, userEmail);
      if (Object.keys(updatePersonalMarketDto).includes('home_id')) {
        const { home_id } = updatePersonalMarketDto;
        await this.validateHome(home_id, userEmail);
        personalMarket.home = await this.homeService.getHouseInfo(
          home_id,
          userEmail,
        );
      }

      await this.personalMarketRepository.save(personalMarket);
    }
    return {
      msg: `Personal market has been updated`,
    };
  }

  async remove(id: number) {
    return `This action removes a #${id} personalMarket`;
  }

  async validateHome(personalMarketId: number, userEmail: string) {
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

      await this.homeService.getHouseInfo(home_id, userEmail);
    } catch (e) {
      throw new NotFoundException('Personal market not found for the home');
    }
  }
}
