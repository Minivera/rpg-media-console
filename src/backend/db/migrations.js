import {
  applyMigration,
  getCurrentMigration,
  migrations,
} from './migrations/index.js';

export const migrateDB = database => {
  if (migrations.length <= 0) {
    return;
  }

  const currentMigration = getCurrentMigration(database);
  migrations.forEach(migration => {
    if (currentMigration.id >= migration.id) {
      return;
    }

    applyMigration(database, migration);
  });
};
