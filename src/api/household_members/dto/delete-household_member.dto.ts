import { IsEmail, IsNumber } from 'class-validator';

export class DeleteHouseholdMemberDto {
  @IsEmail()
  emailGuest: string;

  @IsNumber()
  homeId: number;
}
