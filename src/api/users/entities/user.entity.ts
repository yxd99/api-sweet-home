import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { HouseholdMember } from '@api/household_members/entities/household_member.entity';

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
    name: 'code_expire_in',
  })
  codeExpireIn: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => HouseholdMember, (householdMember) => householdMember.user)
  householdMembers: HouseholdMember[];
}
