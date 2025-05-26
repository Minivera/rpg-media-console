export const insertFirstMigration = {
  id: 1,
  sql: database => database.exec(`INSERT INTO migrations VALUES (0);`),
};
