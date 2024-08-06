import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HomesService } from '@api/homes/homes.service';
import { UsersService } from '@api/users/users.service';
import { MailService } from '@shared/mail/mail.service';

import { CreateHouseholdMemberDto } from './dto/create-household_member.dto';
import { HouseholdMember } from './entities/household_member.entity';

@Injectable()
export class HouseholdMembersService {
  constructor(
    @InjectRepository(HouseholdMember)
    private readonly householdMemberRepository: Repository<HouseholdMember>,
    @Inject(forwardRef(() => HomesService))
    private readonly homeService: HomesService,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async create(createHouseholdMemberDto: CreateHouseholdMemberDto) {
    const user = await this.userService.findByEmail(
      createHouseholdMemberDto.userInvited,
    );

    const home = await this.homeService.findOne(
      createHouseholdMemberDto.homeId,
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

  async addMemberToHome(homeId: number, userId: number, emailInvited: string) {
    if (await this.verifyIfMemberOfTheHousehold(homeId, emailInvited)) {
      throw new BadRequestException(`User ${emailInvited} is a member`);
    }
    const home = await this.homeService.findOne(homeId);

    const user = await this.userService.findByEmail(emailInvited);
    const host = await this.userService.findById(userId);
    if (user === null) {
      await this.userService.create({ email: emailInvited });
    }
    await this.create({
      homeId,
      userInvited: emailInvited,
    });
    await this.mailService.inviteUser(emailInvited, host.name, home.name);
    return {
      msg: `user ${emailInvited} has been invited to ${home.name}`,
    };
  }

  async verifyIfMemberOfTheHousehold(homeId: number, email: string) {
    return this.householdMemberRepository.exist({
      relations: ['home', 'user'],
      where: {
        home: {
          id: homeId,
        },
        user: {
          email,
        },
      },
    });
  }

  async remove(email: string, homeId: number) {
    if (!(await this.verifyIfMemberOfTheHousehold(homeId, email))) {
      throw new BadRequestException('The user isnt a member');
    }
    const household = await this.householdMemberRepository.findOne({
      relations: ['user', 'home'],
      where: {
        home: {
          id: homeId,
        },
        user: {
          email,
        },
      },
    });
    await this.householdMemberRepository.softRemove(household);
    return {
      msg: `${household.user.email} has been removed from ${household.home.name}`,
    };
  }

  async deleteMember(userId: number, emailGuest: string, homeId: number) {
    await this.homeService.getHouseInfo(homeId, userId);
    return this.remove(emailGuest, homeId);
  }
}
