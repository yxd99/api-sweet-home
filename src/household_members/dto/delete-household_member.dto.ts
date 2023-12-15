import { IsEmail, IsNumber } from 'class-validator';

export class DeleteHouseholdMemberDto {
  @IsEmail()
  email_guest: string;

  @IsNumber()
  home_id: number;
}
