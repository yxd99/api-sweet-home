import { randomInt } from 'crypto';

import { CodeInterface } from '@common/interfaces';

export function generateRandomCode(): CodeInterface {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += randomInt(0, 10).toString();
  }

  return {
    code,
    expire: new Date().getTime() + 15 * 60000,
  };
}
