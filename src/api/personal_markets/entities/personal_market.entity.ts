import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Home } from '@api/homes/entities/home.entity';
import { SupermarketProduct } from '@api/supermarket-products/entities/supermarket-product.entity';

@Entity('personal_markets')
export class PersonalMarket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @ManyToOne(() => Home, (home) => home.id)
  @JoinColumn({
    name: 'home_id',
  })
  home: Home;

  @OneToMany(
    () => SupermarketProduct,
    (supermarketProducts) => supermarketProducts.market,
    { cascade: true },
  )
  products: SupermarketProduct[];
}
