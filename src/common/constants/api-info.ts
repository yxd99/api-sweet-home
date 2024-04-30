export const TITLE = 'Api My Home';
export const DESCRIPTION = `Api develop for the project my-home`;
export const VERSION = 'v1';
export const PREFIX = 'api';
export const PORT = process.env.PORT ?? 3000;
export const SERVERS = [
  {
    host: `http://localhost:${PORT}/api`,
    description: 'Dev',
  },
];
