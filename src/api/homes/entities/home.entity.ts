import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

import { HouseholdMember } from '@api/household_members/entities/household_member.entity';
import { PersonalMarket } from '@api/personal_markets/entities/personal_market.entity';

@Entity('homes')
export class Home {
  @PrimaryGeneratedColumn()
  id: number;

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

  @DeleteDateColumn({
    select: false,
    name: 'delete_date',
  })
  deleteDate: string;

  @OneToMany(() => PersonalMarket, (personalMarker) => personalMarker.home)
  personalMarkets: PersonalMarket[];
}
