export const withinTransaction = (database, runner) => {
  database.exec('BEGIN TRANSACTION;');

  try {
    const result = runner();

    database.exec('COMMIT TRANSACTION;');
    return result;
  } catch (e) {
    database.exec('ROLLBACK TRANSACTION;');
    throw e;
  }
};
