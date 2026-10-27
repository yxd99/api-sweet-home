import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class ProductRefDto {
  @IsNumber()
  id: number;
}

class PersonalMarketRefDto {
  @IsNumber()
  id: number;
}

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

  @ApiPropertyOptional({ example: 3600 })
  @IsNumber()
  @IsOptional()
  cost?: number;

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
  personalMarketId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  product_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  productId?: number;

  @ApiPropertyOptional({ type: ProductRefDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductRefDto)
  product?: ProductRefDto;

  @ApiPropertyOptional({ type: PersonalMarketRefDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalMarketRefDto)
  personalMarket?: PersonalMarketRefDto;
}
