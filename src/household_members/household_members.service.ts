import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CreateHouseholdMemberDto } from './dto/create-household_member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HouseholdMember } from './entities/household_member.entity';
import { Repository } from 'typeorm';
import { HomesService } from 'src/homes/homes.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';

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
      createHouseholdMemberDto.user_invited,
    );

    const home = await this.homeService.findOne(
      createHouseholdMemberDto.home_id,
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

  async addMemberToHome(
    homeId: number,
    userEmail: string,
    userEmailInvited: string,
  ) {
    if (await this.verifyIfMemberOfTheHousehold(homeId, userEmailInvited))
      throw new BadRequestException(`User ${userEmailInvited} is a household`);
    const home = await this.homeService.findOne(homeId);

    const user = await this.userService.findByEmail(userEmailInvited);
    if (user === null)
      await this.userService.create({ email: userEmailInvited });
    await this.create({
      home_id: homeId,
      user_invited: userEmailInvited,
    });
    await this.mailService.inviteUser(userEmailInvited, userEmail, home.name);
    return {
      msg: `user ${userEmailInvited} has been invited to ${home.name}`,
    };
  }

  async verifyIfMemberOfTheHousehold(homeId: number, userEmail: string) {
    const verification = await this.householdMemberRepository.exist({
      relations: ['home', 'user'],
      where: {
        home: {
          id: homeId,
        },
        user: {
          email: userEmail,
        },
      },
    });
    return verification;
  }

  async remove(userEmail: string, homeId: number) {
    if (!(await this.verifyIfMemberOfTheHousehold(homeId, userEmail)))
      throw new BadRequestException('The user isnt a member');
    const household = await this.householdMemberRepository.findOne({
      relations: ['user', 'home'],
      where: {
        home: {
          id: homeId,
        },
        user: {
          email: userEmail,
        },
      },
    });
    await this.householdMemberRepository.softRemove(household);
    return {
      msg: `${household.user.email} has been removed from ${household.home.name}`,
    };
  }

  async deleteMember(emailHost: string, emailGuest: string, homeId: number) {
    await this.homeService.getHouseInfo(homeId, emailHost);
    return await this.remove(emailGuest, homeId);
  }
}
