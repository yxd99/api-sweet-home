import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePersonalMarketDto {
  @IsString()
  @MaxLength(50)
  @MinLength(2)
  name: string;

  @IsNumber()
  home_id: number;
}
