import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PersonalMarket } from '@api/personal_markets/entities/personal_market.entity';
import { Product } from '@api/products/entities/product.entity';

import { SupermarketProduct } from './entities/supermarket-product.entity';
import { SupermarketProductsController } from './supermarket-products.controller';
import { SupermarketProductsService } from './supermarket-products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupermarketProduct, PersonalMarket, Product]),
  ],
  controllers: [SupermarketProductsController],
  providers: [SupermarketProductsService],
  exports: [SupermarketProductsService],
})
export class SupermarketProductsModule {}
