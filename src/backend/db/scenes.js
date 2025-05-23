import { database } from './db.js';
import { getPlaylists } from './playlists.js';

export const getScenes = ({ search, gameId, withPlaylists }) => {
  let where = 'WHERE scenes.game_id = ?';
  let params = [gameId];
  if (search) {
    where += ' AND scenes.name LIKE ?';
    params.push('%' + search + '%');
  }

  let playlistsField = '';
  if (withPlaylists) {
    playlistsField = `,
    json_group_array(DISTINCT playlists.id) AS playlists`;
  }

  const returnedScenes = database
    .prepare(
      `
        SELECT
          scenes.id,
          scenes.name,
          scenes.game_id,
          COUNT (DISTINCT playlists.id) AS playlists_count,
          COUNT (DISTINCT songs.id) AS songs_count${playlistsField}
        FROM scenes
        LEFT JOIN main.playlists playlists ON scenes.id = playlists.scene_id
        LEFT JOIN main.songs songs ON playlists.id = songs.playlist_id
        ${where}
        GROUP BY scenes.id, scenes.name
        ORDER BY scenes.id;
`
    )
    .all(...params);

  let playlists = undefined;
  if (withPlaylists) {
    playlists = {};
    const foundPlaylists = getPlaylists({
      ids: returnedScenes.map(scene => JSON.parse(scene.playlists)).flat(1),
    });

    foundPlaylists.forEach(playlist => {
      if (!playlists[playlist.scene_id]) {
        playlists[playlist.scene_id] = [];
      }

      playlists[playlist.scene_id].push(playlist);
    });
  }

  return returnedScenes.map(scene => ({
    ...scene,
    playlists: withPlaylists ? playlists[scene.id] : undefined,
  }));
};

export const getSceneById = (sceneId, withPlaylists, playlistSearch) => {
  let playlistsField = '';
  if (withPlaylists) {
    playlistsField = `,
    json_group_array(DISTINCT playlists.id) AS playlists`;
  }

  const params = [];
  let playlistSearchStatement = '';
  if (playlistSearch) {
    // TODO: The way this is built right now invalidates the playlist and songs count
    // TODO: this is fine because we currently don't use the search when we care
    // TODO: about the counts.
    playlistSearchStatement = ' AND playlists.name LIKE ?';
    params.push('%' + playlistSearch + '%');
  }

  const returnedScene = database
    .prepare(
      `
        SELECT
          scenes.id,
          scenes.name,
          scenes.game_id,
          COUNT (playlists.id) AS playlistsCount,
          COUNT (songs.id) AS songsCount${playlistsField}
        FROM scenes
        LEFT JOIN main.playlists playlists ON scenes.id = playlists.scene_id${playlistSearchStatement}
        LEFT JOIN main.songs songs ON playlists.id = songs.playlist_id
        WHERE scenes.id = ?
        GROUP BY scenes.id, scenes.name
        LIMIT 1;
      `
    )
    .get(...params, sceneId);

  let playlists = undefined;
  if (withPlaylists) {
    playlists = getPlaylists({
      sceneId,
      ids: JSON.parse(returnedScene.playlists),
    });
  }

  return {
    ...returnedScene,
    playlists,
  };
};

export const addScene = (sceneName, gameId) => {
  return database
    .prepare(
      `
        INSERT INTO scenes (name, game_id) VALUES (?, ?) RETURNING id, name;
      `
    )
    .get(sceneName, gameId);
};

export const updateScene = (sceneId, sceneName) => {
  return database
    .prepare(
      `
        UPDATE scenes SET name = ? WHERE id = ? RETURNING id, name;
      `
    )
    .get(sceneName, sceneId);
};

export const deleteScene = sceneId => {
  return database
    .prepare(
      `
        DELETE FROM scenes WHERE id = ?;
      `
    )
    .run(sceneId);
};
