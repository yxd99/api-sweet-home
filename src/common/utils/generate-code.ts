import { randomInt } from 'crypto';

import { codeInterface } from '@common/interfaces';

export function generateRandomCode(): codeInterface {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += randomInt(0, 10).toString();
  }

  return {
    code,
    expire: new Date().getTime() + 15 * 60000,
  };
}
