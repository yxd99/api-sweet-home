import { Module } from '@nestjs/common';
import { SupermarketProductsService } from './supermarket-products.service';
import { SupermarketProductsController } from './supermarket-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupermarketProduct } from './entities/supermarket-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupermarketProduct])],
  controllers: [SupermarketProductsController],
  providers: [SupermarketProductsService],
  exports: [SupermarketProductsService],
})
export class SupermarketProductsModule {}
