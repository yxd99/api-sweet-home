import {
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Home } from '@api/homes/entities/home.entity';
import { User } from '@api/users/entities/user.entity';

@Entity('household_members')
export class HouseholdMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Home, (home) => home.id)
  @JoinColumn({
    name: 'homeId',
  })
  home: Home;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  @DeleteDateColumn({
    select: false,
  })
  delete_date: string;
}
