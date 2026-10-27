import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { Home } from '@api/homes/entities/home.entity';
import { User } from '@api/users/entities/user.entity';

@Entity('household_members')
@Unique(['home', 'user'])
export class HouseholdMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false, name: 'is_owner' })
  isOwner: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_admin' })
  isAdmin: boolean;

  @ManyToOne(() => Home, (home) => home.id)
  @JoinColumn({
    name: 'home_id',
  })
  home: Home;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({
    select: false,
    name: 'delete_date',
  })
  deleteDate: string;
}
