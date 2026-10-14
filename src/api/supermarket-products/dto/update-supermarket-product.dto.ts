import { PartialType } from '@nestjs/swagger';
import { CreateSupermarketProductDto } from './create-supermarket-product.dto';

export class UpdateSupermarketProductDto extends PartialType(CreateSupermarketProductDto) {}
