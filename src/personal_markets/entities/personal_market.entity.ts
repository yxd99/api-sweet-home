import { Home } from 'src/homes/entities/home.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
