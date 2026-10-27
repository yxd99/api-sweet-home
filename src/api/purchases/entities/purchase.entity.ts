import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

import { SupermarketProduct } from '@api/supermarket-products/entities/supermarket-product.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SupermarketProduct)
  @JoinColumn({ name: 'id_supermarket_product' })
  supermarketProduct: SupermarketProduct;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  cost: number;

  @CreateDateColumn({ name: 'date' })
  date: Date;
}
