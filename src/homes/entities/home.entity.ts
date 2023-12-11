import { HouseholdMember } from 'src/household_members/entities/household_member.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany(() => HouseholdMember, (householdMember) => householdMember.home)
  householdMembers: HouseholdMember[];
}
