import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSupermarketProductDto {
  @ApiPropertyOptional({ example: 'Leche entera' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 3600 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'Supermercado' })
  @IsString()
  @IsOptional()
  market?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  market_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  product_id?: number;

  @ApiPropertyOptional({ example: 3600 })
  @IsNumber()
  @IsOptional()
  cost?: number;
}
