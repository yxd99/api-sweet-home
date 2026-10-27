import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { RefreshTokenHeaderDto } from './refresh-token-header.dto';

export const RefreshTokenHeaders = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const dto = plainToInstance(RefreshTokenHeaderDto, request.headers);

    const errors = validateSync(dto);
    if (errors.length > 0) {
      throw new BadRequestException('Missing or invalid refresh-token header');
    }

    return dto['refresh-token'];
  },
);
