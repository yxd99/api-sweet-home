import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePersonalMarketDto {
  @ApiPropertyOptional({ example: 'Mercado del barrio' })
  @IsString()
  @IsOptional()
  marketName?: string;

  @ApiPropertyOptional({ example: 'Mercado del barrio' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  homeId: number;
}
