import { IsString, MinLength } from 'class-validator';

export class DisableTokensHeaderDto {
  @IsString()
  @MinLength(10)
  token: string;

  @IsString()
  @MinLength(10)
  'refresh-token': string;
}
