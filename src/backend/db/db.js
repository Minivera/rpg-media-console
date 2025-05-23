import { DatabaseSync } from 'node:sqlite';
import { migrateDB } from './migrations.js';

const dbPath = process.env.SERVER_DB_PATH;
export const database = new DatabaseSync(dbPath);

export const runMigrations = () => migrateDB(database);
