import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { PersonalMarket } from '@api/personal_markets/entities/personal_market.entity';
import { Product } from '@api/products/entities/product.entity';

@Entity('supermarket_products')
@Unique(['product', 'market'])
export class SupermarketProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    default: 0,
    nullable: true,
  })
  cost: number;

  @Column({
    type: 'int',
    default: 0,
    nullable: true,
  })
  price: number;

  @ManyToOne(() => Product, (product) => product.supermarketProducts)
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;

  @ManyToOne(() => PersonalMarket, (personalMarket) => personalMarket.supermarketProducts)
  @JoinColumn({
    name: 'market_id',
  })
  market: PersonalMarket;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
