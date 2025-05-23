import { database } from './db.js';

export const getPlaylists = ({ search, sceneId, ids }) => {
  const where = [];
  const params = [];
  if (sceneId) {
    where.push('playlists.scene_id = ?');
    params.push(sceneId);
  }
  if (search) {
    where.push('playlists.name LIKE ?');
    params.push('%' + search + '%');
  }
  if (ids && ids.length > 0) {
    where.push(`playlists.id IN (${ids.map(() => '?').join(', ')})`);
    params.push(...ids);
  }

  const returnedPlaylists = database
    .prepare(
      `
        SELECT
          playlists.id,
          playlists.name,
          playlists.scene_id,
          COUNT (DISTINCT songs.id) AS songs_count,
          (
            SELECT
              json_group_array(json_object(
                'image', songs.image,
                'display_name', songs.display_name
              ))
            FROM (
              SELECT *
              FROM songs
              WHERE songs.playlist_id = playlists.id
              ORDER BY songs.playlist_order
              LIMIT 4
            ) as songs
          ) AS featured_songs
        FROM playlists
        LEFT JOIN main.songs songs ON playlists.id = songs.playlist_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        GROUP BY playlists.id, playlists.name
        ORDER BY playlists.id;
`
    )
    .all(...params);

  return returnedPlaylists.map(playlist => ({
    ...playlist,
    featured_songs: JSON.parse(playlist.featured_songs),
  }));
};

export const getPlaylistById = playlistId => {
  const returnedPlaylist = database
    .prepare(
      `
        SELECT
          playlists.id,
          playlists.name,
          playlists.scene_id,
          COUNT (DISTINCT songs.id) AS songs_count,
          (
            SELECT
              json_group_array(json_object(
                'image', songs.image,
                'display_name', songs.display_name
              ))
            FROM (
              SELECT *
              FROM songs
              WHERE songs.playlist_id = playlists.id
              ORDER BY songs.playlist_order
              LIMIT 4
            ) as songs
          ) AS featured_songs
        FROM playlists
        LEFT JOIN main.songs songs on playlists.id = songs.playlist_id
        WHERE playlists.id = ?
        GROUP BY playlists.id, playlists.name
        LIMIT 1;
      `
    )
    .get(playlistId);

  return {
    ...returnedPlaylist,
    featured_songs: JSON.parse(returnedPlaylist.featured_songs),
  };
};

export const getPlaylistWithBetween = (playlistId, sceneId) => {
  const returnedPlaylists = database
    .prepare(
      `
        SELECT
          id,
          name,
          scene_id
        FROM (
               SELECT
                 playlists.id,
                 playlists.name,
                 playlists.scene_id,
                 CASE
                   WHEN playlists.id = first_value(id) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) THEN NULL
                   ELSE first_value(id) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)
                   END AS previous,
                 CASE
                   WHEN playlists.id = last_value(id) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) THEN NULL
                   ELSE last_value(id) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)
                   END AS next
               FROM playlists
               WHERE scene_id = ?)
        WHERE id = ? OR previous = ? OR next = ?
        ORDER BY id;
`
    )
    .all(sceneId, playlistId, playlistId, playlistId);

  let previous,
    current,
    next = null;
  if (returnedPlaylists.length === 1) {
    current = returnedPlaylists[0];
  } else if (returnedPlaylists.length === 2) {
    if (returnedPlaylists[0].id === playlistId) {
      current = returnedPlaylists[0];
      next = returnedPlaylists[1];
    } else {
      previous = returnedPlaylists[0];
      current = returnedPlaylists[1];
    }
  } else if (returnedPlaylists.length === 3) {
    previous = returnedPlaylists[0];
    current = returnedPlaylists[1];
    next = returnedPlaylists[2];
  }

  return [previous, current, next];
};

export const addPlaylist = (playlistName, sceneId) => {
  return database
    .prepare(
      `
        INSERT INTO playlists (name, scene_id) VALUES (?, ?) RETURNING id, name;
      `
    )
    .get(playlistName, sceneId);
};

export const updatePlaylist = (playlistId, playlistName) => {
  return database
    .prepare(
      `
        UPDATE playlists SET name = ? WHERE id = ? RETURNING id, name;
      `
    )
    .get(playlistName, playlistId);
};

export const deletePlaylist = playlistId => {
  return database
    .prepare(
      `
        DELETE FROM playlists WHERE id = ?;
      `
    )
    .run(playlistId);
};
