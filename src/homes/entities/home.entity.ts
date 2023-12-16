import { HouseholdMember } from 'src/household_members/entities/household_member.entity';
import { PersonalMarket } from 'src/personal_markets/entities/personal_market.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

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
  household_members: HouseholdMember[];

  @DeleteDateColumn({
    select: false,
  })
  delete_date: string;

  @OneToMany(() => PersonalMarket, (personalMarker) => personalMarker.home)
  personal_markets: PersonalMarket[];
}
