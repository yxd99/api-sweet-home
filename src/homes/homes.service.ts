import {
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
    console.log(email);

    const homes = await this.homeRepository.find({
      relations: ['householdMembers', 'householdMembers.user'],
      where: {
        householdMembers: {
          user: {
            email,
          },
        },
      },
    });

    return homes;
  }

  async findOne(id: number, email: string): Promise<Home> {
    const home = await this.homeRepository.findOne({
      relations: ['householdMembers', 'householdMembers.user'],
      where: {
        id,
        householdMembers: {
          user: {
            email,
          },
        },
      },
    });
    if (home != null) return home;
    throw new NotFoundException('Home not found');
  }

  update(id: number, updateHomeDto: UpdateHomeDto) {
    return `This action updates a #${id}, ${updateHomeDto.name} home`;
  }

  remove(id: number) {
    return `This action removes a #${id} home`;
  }
}
