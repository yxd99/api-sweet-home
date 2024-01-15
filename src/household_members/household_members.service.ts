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
    home_id: number,
    email: string,
    emailInvited: string,
  ) {
    if (await this.verifyIfMemberOfTheHousehold(home_id, emailInvited))
      throw new BadRequestException(`User ${emailInvited} is a household`);
    const home = await this.homeService.findOne(home_id);

    const user = await this.userService.findByEmail(emailInvited);
    if (user === null)
      await this.userService.create({ email: emailInvited });
    await this.create({
      home_id: home_id,
      user_invited: emailInvited,
    });
    await this.mailService.inviteUser(emailInvited, email, home.name);
    return {
      msg: `user ${emailInvited} has been invited to ${home.name}`,
    };
  }

  async verifyIfMemberOfTheHousehold(home_id: number, email: string) {
    const verification = await this.householdMemberRepository.exist({
      relations: ['home', 'user'],
      where: {
        home: {
          id: home_id,
        },
        user: {
          email: email,
        },
      },
    });
    return verification;
  }

  async remove(email: string, home_id: number) {
    if (!(await this.verifyIfMemberOfTheHousehold(home_id, email)))
      throw new BadRequestException('The user isnt a member');
    const household = await this.householdMemberRepository.findOne({
      relations: ['user', 'home'],
      where: {
        home: {
          id: home_id,
        },
        user: {
          email: email,
        },
      },
    });
    await this.householdMemberRepository.softRemove(household);
    return {
      msg: `${household.user.email} has been removed from ${household.home.name}`,
    };
  }

  async deleteMember(emailHost: string, emailGuest: string, home_id: number) {
    await this.homeService.getHouseInfo(home_id, emailHost);
    return await this.remove(emailGuest, home_id);
  }
}
