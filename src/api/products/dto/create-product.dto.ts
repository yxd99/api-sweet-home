import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Arroz' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  homeId: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  personalMarketId?: number;
}
