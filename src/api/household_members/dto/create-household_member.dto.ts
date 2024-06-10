import { IsEmail, IsNumber } from 'class-validator';

export class CreateHouseholdMemberDto {
  @IsEmail()
  userInvited: string;

  @IsNumber()
  homeId: number;
}
