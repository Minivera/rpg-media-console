import { readFileSync } from 'node:fs';

const oldDBPath = process.env.SERVER_OLD_DB_PATH;

export const runJSONInsertion = (database, dbJson) => {
  const insertGame = database.prepare(`INSERT INTO games (name) VALUES (?);`);
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
};

export const injectDbJSON = {
  id: 2,
  sql: database => {
    const dbJson = JSON.parse(readFileSync(oldDBPath).toString());

    // Start transaction
    database.exec('BEGIN TRANSACTION');

    try {
      runJSONInsertion(database, dbJson);
    } catch (e) {
      console.error(e);
      database.exec('ROLLBACK TRANSACTION');

      return;
    }

    database.exec('COMMIT TRANSACTION');
  },
};
