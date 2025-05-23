import { readFileSync } from 'node:fs';

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

export const migrations = [
  {
    id: 0,
    sql: database =>
      database.exec(`
CREATE TABLE IF NOT EXISTS migrations(
  id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY, 
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  game_id INTEGER NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  scene_id INTEGER NOT NULL,
  FOREIGN KEY(scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  image TEXT NOT NULL,
  url TEXT NOT NULL,
  author TEXT NOT NULL,
  duration INTEGER NOT NULL,
  playlist_order INTEGER NOT NULL,
  playlist_id INTEGER NOT NULL,
  FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_states (
  id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  game_id INTEGER NOT NULL,
  parent_state_id INTEGER,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_state_id) REFERENCES game_states(id) ON DELETE CASCADE
);
    `),
  },
  {
    id: 1,
    sql: database => database.exec(`INSERT INTO migrations VALUES (0);`),
  },
  {
    id: 2,
    sql: database => {
      const dbJson = JSON.parse(readFileSync(oldDBPath).toString());

      const insertGame = database.prepare(
        `INSERT INTO games (name) VALUES (?);`
      );
      const insertScene = database.prepare(
        `INSERT INTO scenes (name, game_id) VALUES (?, ?);`
      );
      const insertPlaylist = database.prepare(
        `INSERT INTO playlists (name, scene_id) VALUES (?, ?);`
      );
      const insertSong =
        database.prepare(`INSERT INTO songs (name, display_name, image, url, author, duration, playlist_order, playlist_id)
                                           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`);

      const getLastInsertedID = database.prepare(
        'SELECT last_insert_rowid() AS id;'
      );

      // Start transaction
      database.exec('BEGIN TRANSACTION');

      try {
        dbJson.games.forEach(game => {
          insertGame.run(game.name);
          const gameID = getLastInsertedID.get().id;

          game.scenes.forEach(scene => {
            insertScene.run(scene.name, gameID);
            const sceneID = getLastInsertedID.get().id;

            scene.playlists.forEach(playlist => {
              insertPlaylist.run(playlist.name, sceneID);
              const playlistID = getLastInsertedID.get().id;

              playlist.songs.forEach((song, index) => {
                insertSong.run(
                  song.originalName,
                  song.name,
                  song.image,
                  song.url,
                  song.author,
                  song.duration,
                  index,
                  playlistID
                );
              });
            });
          });
        });
      } catch (e) {
        console.error(e);
        database.exec('ROLLBACK TRANSACTION');

        return;
      }

      database.exec('COMMIT TRANSACTION');
    },
  },
];
