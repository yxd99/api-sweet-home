import { HouseholdMember } from 'src/household_members/entities/household_member.entity';
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
    length: 10,
    nullable: false,
  })
  name: string;

  @OneToMany(() => HouseholdMember, (householdMember) => householdMember.home, {
    cascade: true,
  })
  householdMembers: HouseholdMember[];

  @DeleteDateColumn({
    select: false,
  })
  delete_date: string;
}
