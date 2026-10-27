import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { CreateHomeDto } from './create-home.dto';

export class UpdateHomeDto extends PartialType(CreateHomeDto) {
  @ApiPropertyOptional({ example: 'Casa nueva', minLength: 3, maxLength: 60 })
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  name?: string;
}
