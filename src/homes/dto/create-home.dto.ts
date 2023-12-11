import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateHomeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  name: string;
}
