import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateHomeDto {
  @ApiProperty({ example: 'Casa de verano', minLength: 3, maxLength: 60 })
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  name: string;
}
