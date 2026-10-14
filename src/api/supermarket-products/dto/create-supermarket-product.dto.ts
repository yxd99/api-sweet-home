import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateSupermarketProductDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @Min(0)
  market_id: number;

  @IsNumber()
  @Min(0)
  product_id: number;
}
