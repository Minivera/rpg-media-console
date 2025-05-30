import { database } from './db.js';

export const getGames = ({ search }) => {
  let where = '';
  let params = [];
  if (search) {
    where = 'WHERE games.name LIKE ?';
    params.push('%' + search + '%');
  }

  return database
    .prepare(
      `
        SELECT
          games.id,
          games.name,
          COUNT (DISTINCT scenes.id) AS scenes_count,
          COUNT (DISTINCT playlists.id) AS playlists_count,
          COUNT (DISTINCT songs.id) AS songs_count
        FROM games
        LEFT JOIN main.scenes scenes ON games.id = scenes.game_id
        LEFT JOIN main.playlists playlists ON scenes.id = playlists.scene_id
        LEFT JOIN main.songs songs ON playlists.id = songs.playlist_id
        ${where}
        GROUP BY games.id, games.name
        ORDER BY games.id;
`
    )
    .all(...params);
};

export const getGameById = gameId => {
  return database
    .prepare(
      `
        SELECT
          games.id,
          games.name,
          COUNT (scenes.id) AS scenes_count,
          COUNT (playlists.id) AS playlistsCount,
          COUNT (songs.id) AS songsCount
        FROM games
        LEFT JOIN main.scenes scenes ON games.id = scenes.game_id
        LEFT JOIN main.playlists playlists ON scenes.id = playlists.scene_id
        LEFT JOIN main.songs songs ON playlists.id = songs.playlist_id
        WHERE games.id = ?
        GROUP BY games.id, games.name
        LIMIT 1;
      `
    )
    .get(gameId);
};

export const addGame = gameName => {
  return database
    .prepare(
      `
        INSERT INTO games (name) VALUES (?) RETURNING id, name;
      `
    )
    .get(gameName);
};

export const updateGame = (gameId, gameName) => {
  return database
    .prepare(
      `
        UPDATE games SET name = ? WHERE id = ? RETURNING id, name;
      `
    )
    .get(gameName, gameId);
};

export const deleteGame = gameId => {
  return database
    .prepare(
      `
        DELETE FROM games WHERE id = ?;
      `
    )
    .run(gameId);
};

export const deleteAllGames = () => {
  return database.prepare(`DELETE FROM games;`).run();
};

export const exportGames = () => {
  return database
    .prepare(
      `
    SELECT
      json_group_array(json_object(
        'id', games.id,
        'name', games.name,
        'scenes', (
          SELECT
            json_group_array(
              json_object(
                'id', scenes.id,
                'name', scenes.name,
                'playlists', (
                  SELECT
                    json_group_array(
                      json_object(
                        'id', playlists.id,
                        'name', playlists.name,
                        'songs', (
                          SELECT
                            json_group_array(
                              json_object(
                                'id', songs.id,
                                'originalName', songs.name,
                                'name', songs.display_name,
                                'author', songs.author,
                                'image', songs.image,
                                'url', songs.url,
                                'duration', songs.duration
                              )
                            )
                          FROM songs
                          WHERE playlists.id = songs.playlist_id
                        )
                      )
                    )
                  FROM playlists
                  WHERE scenes.id = playlists.scene_id
                )
              )
            )
          FROM scenes
          WHERE games.id = scenes.game_id
        )
    )) as games
    FROM games
`
    )
    .get();
};
