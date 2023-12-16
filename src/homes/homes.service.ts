import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { Home } from './entities/home.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseholdMembersService } from 'src/household_members/household_members.service';

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
    const home_id = (await this.homeRepository.save(createHomeDto)).id;
    await this.householdMembersService.create({
      home_id,
      user_invited: emailUser,
    });
    return {
      msg: `House ${createHomeDto.name} has been create`,
    };
  }

  async findAll(email: string): Promise<object> {
    const homes = await this.homeRepository.find({
      relations: ['household_members', 'household_members.user'],
      where: {
        household_members: {
          user: {
            email,
          },
        },
      },
    });

    return homes;
  }

  async findOne(id: number): Promise<Home> {
    if (isNaN(id)) throw new BadRequestException('id isnt number');
    const home = await this.homeRepository.findOne({
      relations: ['household_members', 'household_members.user'],
      where: {
        id,
      },
    });
    if (home === null) throw new NotFoundException('Home not found');
    return home;
  }

  async update(home_id: number, updateHomeDto: UpdateHomeDto, email: string) {
    if (Object.keys(updateHomeDto).length === 0)
      throw new BadRequestException('The data to update isnt null');
    const home = await this.getHouseInfo(home_id, email);
    await this.homeRepository.update(home_id, updateHomeDto);
    return {
      msg: `Home ${home.name} has been updated to ${updateHomeDto.name}`,
    };
  }

  async remove(homeId: number, email: string) {
    if (isNaN(homeId)) throw new BadRequestException('id isnt number');
    await this.householdMembersService.verifyIfMemberOfTheHousehold(
      homeId,
      email,
    );
    const home = await this.findOne(homeId);

    await this.homeRepository.softRemove(home);
    return { msg: `${home.name} has been removed successfully` };
  }

  async getHouseInfo(id: number, email: string) {
    if (isNaN(id)) throw new BadRequestException('id isnt number');
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
