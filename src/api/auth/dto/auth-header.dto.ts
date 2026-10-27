import { IsString, MinLength } from 'class-validator';

export class AuthHeaderDto {
  @IsString()
  @MinLength(10)
  token: string;
}
