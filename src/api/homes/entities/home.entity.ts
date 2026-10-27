import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { HouseholdMember } from '@api/household_members/entities/household_member.entity';
import { PersonalMarket } from '@api/personal_markets/entities/personal_market.entity';
import { User } from '@api/users/entities/user.entity';

@Entity('homes')
export class Home {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  name: string;

  @OneToMany(() => HouseholdMember, (householdMember) => householdMember.home, {
    cascade: true,
  })
  householdMembers: HouseholdMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({
    select: false,
    name: 'delete_date',
  })
  deleteDate: string;

  @OneToMany(() => PersonalMarket, (personalMarker) => personalMarker.home)
  personalMarkets: PersonalMarket[];
}
