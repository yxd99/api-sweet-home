import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

import { Debt } from '@api/debts/entities/debt.entity';
import { User } from '@api/users/entities/user.entity';

@Entity('payment_of_debts')
export class PaymentOfDebt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Debt)
  @JoinColumn({ name: 'id_debt' })
  debt: Debt;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'date' })
  date: Date;
}
