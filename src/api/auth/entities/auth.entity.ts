import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@api/users/entities/user.entity';

export enum TOKEN_TYPE {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  token: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isEnable: boolean;

  @Column({
    type: 'enum',
    enum: TOKEN_TYPE,
  })
  tokenType: TOKEN_TYPE;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
