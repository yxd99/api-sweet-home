import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreatePersonalMarketDto {
  @ApiProperty({ example: 'Mercado del barrio', name: 'marketName' })
  @IsString()
  marketName: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  homeId: number;

  @ApiProperty({ example: 'Mercado del barrio', required: false })
  @IsString()
  name?: string;
}
