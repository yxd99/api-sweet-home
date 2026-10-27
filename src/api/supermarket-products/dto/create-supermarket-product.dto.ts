import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSupermarketProductDto {
  @ApiProperty({ example: 'Leche' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 3500 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Almacén', required: false })
  @IsString()
  @IsOptional()
  market?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  market_id?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  product_id?: number;

  @ApiProperty({ example: 3500, required: false })
  @IsNumber()
  @IsOptional()
  cost?: number;
}
