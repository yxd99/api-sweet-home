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
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class HomesService {
  constructor(
    @InjectRepository(Home)
    private readonly homeRepository: Repository<Home>,
    @Inject(forwardRef(() => HouseholdMembersService))
    private readonly householdMembersService: HouseholdMembersService,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
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

  async findOne(id: number): Promise<Home> {
    if (isNaN(id)) throw new BadRequestException('id isnt number');
    const home = await this.homeRepository.findOne({
      relations: ['householdMembers', 'householdMembers.user'],
      where: {
        id,
      },
    });
    if (home === null) throw new NotFoundException('Home not found');
    return home;
  }

  async update(home_id: number, updateHomeDto: UpdateHomeDto, email: string) {
    await this.householdMembersService.verifyIfMemberOfTheHousehold(
      home_id,
      email,
    );
    const home = await this.findOne(home_id);
    await this.homeRepository.update(home_id, updateHomeDto);
    return `Home ${home.name} has been updated to ${updateHomeDto.name}`;
  }

  async remove(home_id: number, email: string) {
    await this.householdMembersService.verifyIfMemberOfTheHousehold(
      home_id,
      email,
    );
    const home = await this.findOne(home_id);
    await this.homeRepository.softDelete(home);
    return `${home.name} has been removed successfully`;
  }

  async addMemberToHome(
    home_id: number,
    userEmail: string,
    userEmailInvited: string,
  ) {
    if (
      await this.householdMembersService.verifyIfMemberOfTheHousehold(
        home_id,
        userEmailInvited,
      )
    )
      throw new BadRequestException(`User ${userEmailInvited} is a household`);
    const home = await this.findOne(home_id);

    const user = await this.userService.findByEmail(userEmailInvited);
    if (user === null)
      await this.userService.create({ email: userEmailInvited });
    await this.householdMembersService.create({
      home_id,
      user_invited: userEmailInvited,
    });
    await this.mailService.inviteUser(userEmailInvited, userEmail, home.name);
    return {
      msg: `user ${userEmailInvited} has been invited to ${home.name}`,
    };
  }

  async getHouseInfo(id: number, email: string) {
    if (isNaN(id)) throw new BadRequestException('id isnt number');
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
    if (home === null) throw new NotFoundException('Home not found');
    return home;
  }
}
