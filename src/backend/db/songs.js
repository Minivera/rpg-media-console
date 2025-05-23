import { database } from './db.js';

export const getSongs = ({ search, gameId, playlistId }) => {
  let where = [];
  let joins = '';
  let params = [];
  if (gameId) {
    joins = `
        LEFT JOIN playlists ON playlists.id = songs.playlist_id
        LEFT JOIN scenes ON scenes.id = playlists.scene_id
        LEFT JOIN games ON games.id = scenes.game_id
    `;
    where.push('games.id = ?');
    params.push(gameId);
  }
  if (playlistId) {
    where.push('songs.playlist_id = ?');
    params.push(playlistId);
  }
  if (search) {
    where.push('(songs.name LIKE ? OR songs.display_name LIKE ?)');
    params.push('%' + search + '%', '%' + search + '%');
  }

  return database
    .prepare(
      `
        SELECT 
          songs.id,
          songs.name,
          songs.display_name,
          songs.image,
          songs.url,
          songs.author,
          songs.duration,
          songs.playlist_id
        FROM songs
        ${joins}
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY songs.playlist_order;
`
    )
    .all(...params);
};

export const getSongById = songId => {
  return database
    .prepare(
      `
        SELECT
          songs.id,
          songs.name,
          songs.display_name,
          songs.image,
          songs.url,
          songs.author,
          songs.duration,
          songs.playlist_id
        FROM songs
        WHERE songs.id = ?;
`
    )
    .get(songId);
};

export const addSong = (
  { originalName, name, image, url, author, duration },
  playlistId
) => {
  return database
    .prepare(
      `
        INSERT INTO songs (name, display_name, image, url, author, duration, playlist_order, playlist_id)
        VALUES (?, ?, ?, ?, ?, ?, (SELECT COUNT(id) + 1 FROM songs WHERE playlist_id = ?), ?)
        RETURNING id, name, display_name, image, url, author, duration, playlist_id;
      `
    )
    .get(
      originalName,
      name,
      image,
      url,
      author,
      duration,
      playlistId,
      playlistId
    );
};

export const updateSong = (
  { originalName, name, image, url, author, duration },
  songId
) => {
  const setStatements = [];
  const params = [];

  if (originalName) {
    setStatements.push('name = ?');
    params.push(originalName);
  }
  if (name) {
    setStatements.push('display_name = ?');
    params.push(name);
  }
  if (image) {
    setStatements.push('image = ?');
    params.push(image);
  }
  if (url) {
    setStatements.push('url = ?');
    params.push(url);
  }
  if (author) {
    setStatements.push('author = ?');
    params.push(author);
  }
  if (duration) {
    setStatements.push('duration = ?');
    params.push(duration);
  }

  if (!setStatements.length) {
    return undefined;
  }

  return database
    .prepare(
      `
        UPDATE songs SET ${setStatements.join(', ')} WHERE id = ? 
        RETURNING id, name, display_name, image, url, author, duration, playlist_id;
      `
    )
    .get(...params, songId);
};

export const updateSongsOrder = songs => {
  const updateSongOrderQuery = database.prepare(
    `
        UPDATE songs SET playlist_order = ? WHERE id = ?;
      `
  );

  database.exec('BEGIN TRANSACTION');

  try {
    songs.forEach((song, index) => {
      updateSongOrderQuery.run(index, song.id);
    });
  } catch (e) {
    console.error(e);
    database.exec('ROLLBACK TRANSACTION');

    return;
  }

  database.exec('COMMIT TRANSACTION');
};

export const deleteSong = songId => {
  return database
    .prepare(
      `
        DELETE FROM songs WHERE id = ?;
      `
    )
    .run(songId);
};
