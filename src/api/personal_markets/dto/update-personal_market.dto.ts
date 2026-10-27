import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePersonalMarketDto {
  @ApiPropertyOptional({ example: 'Nuevo nombre' })
  @IsString()
  @IsOptional()
  marketName?: string;

  @ApiPropertyOptional({ example: 'Nuevo nombre' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  homeId?: number;
}
