import { Module } from '@nestjs/common';
import { SupermarketProductsService } from './supermarket-products.service';
import { SupermarketProductsController } from './supermarket-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupermarketProduct } from './entities/supermarket-product.entity';
import { PersonalMarketsModule } from 'src/personal_markets/personal_markets.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupermarketProduct]),
    PersonalMarketsModule,
    ProductsModule,
  ],
  controllers: [SupermarketProductsController],
  providers: [SupermarketProductsService],
  exports: [SupermarketProductsService],
})
export class SupermarketProductsModule {}
