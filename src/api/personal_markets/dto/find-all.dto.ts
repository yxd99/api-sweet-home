import { IsNumber } from 'class-validator';

export class FindAllDto {
  @IsNumber()
  homeId: number;
}
