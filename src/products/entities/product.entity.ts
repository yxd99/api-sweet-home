import { Home } from 'src/homes/entities/home.entity';
import { SupermarketProduct } from 'src/supermarket-products/entities/supermarket-product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Home, (home) => home.id)
  @JoinColumn({
    name: 'home_id',
  })
  home: Home;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @OneToMany(
    () => SupermarketProduct,
    (supermarketProduct) => supermarketProduct.product,
    { cascade: true },
  )
  products: SupermarketProduct[];
}
