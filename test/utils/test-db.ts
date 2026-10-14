/**
 * The only database the end-to-end suite is allowed to touch.
 *
 * The suite truncates every table between tests, so pointing it at the
 * development database would destroy real data. Every entry point asserts that
 * the connection really targets this database before running a single query.
 */
export const TEST_DATABASE = 'api_sweet_home_test';

export function assertTestDatabase(database: unknown): void {
  if (database !== TEST_DATABASE) {
    throw new Error(
      `Refusing to run end-to-end tests against "${String(database)}". ` +
        `The suite truncates every table and only runs against "${TEST_DATABASE}".`,
    );
  }
}
