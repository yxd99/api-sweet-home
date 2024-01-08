import { PersonalMarket } from 'src/personal_markets/entities/personal_market.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
