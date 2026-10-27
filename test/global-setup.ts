import { config } from 'dotenv';
import { createConnection } from 'mysql2/promise';

import { TEST_DATABASE } from './utils/test-db';

/**
 * Guarantees that the dedicated e2e database exists before any suite opens a
 * connection. Creating a database needs extra grants, so a missing privilege is
 * tolerated as long as the database is already there; anything else fails with
 * a message that says exactly what to provision.
 */
export default async function globalSetup(): Promise<void> {
  config({ quiet: true });

  const connection = await createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    try {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${TEST_DATABASE}\` CHARACTER SET utf8mb4`,
      );
    } catch {
      // The configured user may not be allowed to create databases.
    }

    const [rows] = await connection.query('SHOW DATABASES LIKE ?', [
      TEST_DATABASE,
    ]);

    if ((rows as unknown[]).length === 0) {
      throw new Error(
        `The e2e database "${TEST_DATABASE}" does not exist and could not be created. Create it once with: CREATE DATABASE ${TEST_DATABASE} CHARACTER SET utf8mb4;`,
      );
    }
  } finally {
    await connection.end();
  }
}
