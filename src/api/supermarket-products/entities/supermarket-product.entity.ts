import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PersonalMarket } from '@api/personal_markets/entities/personal_market.entity';
import { Product } from '@api/products/entities/product.entity';

@Entity('supermarket_products')
export class SupermarketProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    default: 0,
    nullable: true,
  })
  cost: number;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;

  @ManyToOne(() => PersonalMarket, (personalMarket) => personalMarket.id)
  @JoinColumn({
    name: 'market_id',
  })
  market: PersonalMarket;
}
