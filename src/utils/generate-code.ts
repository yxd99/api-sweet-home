import { codeInterface } from 'src/interfaces/code.interface';

export function generateRandomCode(): codeInterface {
  let code = '';
  do {
    code = code.concat(Math.floor(Math.random() * 10).toString());
  } while (code.length < 4);
  return {
    code,
    expire: new Date().getTime() + 15 * 60000,
  };
}
