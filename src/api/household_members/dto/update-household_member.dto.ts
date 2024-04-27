import { PartialType } from '@nestjs/swagger';

import { CreateHouseholdMemberDto } from './create-household_member.dto';

export class UpdateHouseholdMemberDto extends PartialType(
  CreateHouseholdMemberDto,
) {}
