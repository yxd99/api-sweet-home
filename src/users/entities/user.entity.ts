import { HouseholdMember } from 'src/household_members/entities/household_member.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'New User',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    nullable: false,
    select: false,
  })
  code: string;

  @Column({
    type: 'bigint',
    nullable: false,
    select: false,
  })
  code_expire_in: number;

  @OneToMany(() => HouseholdMember, (householdMember) => householdMember.user)
  householdMembers: HouseholdMember[];
}
