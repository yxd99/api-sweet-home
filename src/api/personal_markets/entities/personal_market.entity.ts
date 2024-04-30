import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Home } from '@api/homes/entities/home.entity';

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
    name: 'homeId',
  })
  home: Home;
}
