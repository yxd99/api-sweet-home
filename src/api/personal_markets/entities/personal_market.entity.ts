import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => SupermarketProduct,
    (supermarketProducts) => supermarketProducts.market,
    { cascade: true },
  )
  supermarketProducts: SupermarketProduct[];
}
