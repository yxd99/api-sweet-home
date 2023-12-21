import { PartialType } from '@nestjs/swagger';
import { CreatePersonalMarketDto } from './create-personal_market.dto';

export class UpdatePersonalMarketDto extends PartialType(
  CreatePersonalMarketDto,
) {}
