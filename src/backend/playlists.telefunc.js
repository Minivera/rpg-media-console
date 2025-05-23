import { Abort, shield } from 'telefunc';

import {
  addPlaylist,
  deletePlaylist,
  getPlaylistWithBetween,
  getSongs,
  updatePlaylist,
} from './db/index.js';
import { transformPlaylist } from './utils/transformers.js';
import {
  findPlaylistInSceneById,
  findSceneInGameById,
} from './utils.telefunc.js';

const t = shield.type;

export const onAddPlaylistToScene = shield(
  [
    {
      gameId: t.string,
      sceneId: t.or(t.string, t.number),
      playlistName: t.string,
    },
  ],
  async ({ gameId, sceneId, playlistName }) => {
    const scene = findSceneInGameById(gameId, sceneId);

    return transformPlaylist(addPlaylist(playlistName, scene.id));
  }
);

export const onDeletePlaylistInScene = shield(
  [{ gameId: t.string, sceneId: t.string, playlistId: t.string }],
  async ({ gameId, sceneId, playlistId }) => {
    const playlist = findPlaylistInSceneById(gameId, sceneId, playlistId);

    deletePlaylist(playlist.id);
  }
);

export const onUpdatePlaylistInScene = shield(
  [
    {
      gameId: t.string,
      sceneId: t.string,
      playlistId: t.string,
      playlistName: t.string,
    },
  ],
  async ({ gameId, sceneId, playlistId, playlistName }) => {
    const playlist = findPlaylistInSceneById(gameId, sceneId, playlistId);

    return transformPlaylist(updatePlaylist(playlist.id, playlistName));
  }
);

export const onGetPlaylistInSceneById = shield(
  [{ gameId: t.string, sceneId: t.string, playlistId: t.string }],
  async ({ gameId, sceneId, playlistId }) => {
    const scene = findSceneInGameById(gameId, sceneId);

    const playlistIdNumber = Number.parseInt(playlistId, 10);
    const [previous, current, next] = getPlaylistWithBetween(
      playlistIdNumber,
      scene.id
    );

    if (!current) {
      throw Abort({
        errorMessage: `playlist ${playlistId} not found`,
      });
    }

    const playlistSongs = getSongs({ playlistId: current.id });

    return transformPlaylist({
      ...current,
      songs: playlistSongs,
      previous: previous ? transformPlaylist(previous) : undefined,
      next: next ? transformPlaylist(next) : undefined,
    });
  }
);
