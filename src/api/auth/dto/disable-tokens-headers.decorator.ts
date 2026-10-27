import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { DisableTokensHeaderDto } from './disable-tokens-header.dto';

export const DisableTokensHeaders = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const dto = plainToInstance(DisableTokensHeaderDto, request.headers);

    const errors = validateSync(dto);
    if (errors.length > 0) {
      throw new BadRequestException('Missing or invalid token/refresh-token headers');
    }

    return dto;
  },
);
