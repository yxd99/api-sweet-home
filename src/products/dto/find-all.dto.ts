import { IsNumber } from 'class-validator';

export class FindAllDto {
  @IsNumber()
  home_id: number;
}
