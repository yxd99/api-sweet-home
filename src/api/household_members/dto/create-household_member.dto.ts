import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber } from 'class-validator';

export class CreateHouseholdMemberDto {
  @ApiProperty({ example: 'amigo@example.com' })
  @IsEmail()
  userInvited: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  homeId: number;
}
