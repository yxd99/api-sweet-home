import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FindAllDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  homeId: number;
}
