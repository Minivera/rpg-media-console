import { readFileSync } from 'node:fs';
import { createDatabase } from './1_create_database.js';
import { insertFirstMigration } from './2_insert_first_migration.js';
import { injectDbJSON } from './3_inject_db_json.js';

const oldDBPath = process.env.SERVER_OLD_DB_PATH;

export const getCurrentMigration = database => {
  try {
    const getLatestMigrationQuery = database.prepare(`
      SELECT id FROM migrations LIMIT 1;
    `);

    return getLatestMigrationQuery.get() || { id: 0 };
  } catch (e) {
    // On an error, ignore. We most likely were trying to run the first migration on an empty DB
    return { id: -1 };
  }
};

export const applyMigration = (database, migration) => {
  migration.sql(database);

  return database.exec(`UPDATE migrations SET id = ${migration.id};`);
};

export const migrations = [createDatabase, insertFirstMigration, injectDbJSON];
