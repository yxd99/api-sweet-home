import { IsString, MinLength } from 'class-validator';

export class RefreshTokenHeaderDto {
  @IsString()
  @MinLength(10)
  'refresh-token': string;
}
