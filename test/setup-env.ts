import { config } from 'dotenv';

import { TEST_DATABASE } from './utils/test-db';

/**
 * Loads the repository `.env` and then points the application at the dedicated
 * test database, so no suite can ever reach the development data.
 */
config({ quiet: true });

process.env.DB_NAME = TEST_DATABASE;
process.env.ENV = 'test';
process.env.JWT_ACCESS_TOKEN_EXPIRY ??= '1h';
process.env.JWT_REFRESH_TOKEN_EXPIRY ??= '30d';
