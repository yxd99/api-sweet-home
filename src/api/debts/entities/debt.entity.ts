import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Home } from '@api/homes/entities/home.entity';
import { User } from '@api/users/entities/user.entity';

@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_debtor' })
  debtor: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_receiver' })
  receiver: User;

  @ManyToOne(() => Home)
  @JoinColumn({ name: 'id_home' })
  home: Home;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  paid: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
