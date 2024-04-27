import { IsEmail, IsNumber } from 'class-validator';

export class CreateHouseholdMemberDto {
  @IsEmail()
  user_invited: string;

  @IsNumber()
  homeId: number;
}
