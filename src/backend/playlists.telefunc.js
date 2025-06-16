import { Abort, shield } from 'telefunc';

import {
  addPlaylist,
  addSong,
  deletePlaylist,
  getPlaylistById,
  getPlaylistWithBetween,
  getSongs,
  updatePlaylist,
} from './db/index.js';
import { transformPlaylist } from './utils/transformers.js';
import {
  findPlaylistInSceneById,
  findSceneInGameById,
} from './utils.telefunc.js';
import { database } from './db/db.js';
import { withinTransaction } from './db/utils.js';

const t = shield.type;

export const onAddPlaylistToScene = shield(
  [
    {
      gameId: t.string,
      sceneId: t.or(t.string, t.number),
      playlistName: t.string,
      songs: t.optional(
        t.array({
          originalName: t.string,
          name: t.string,
          image: t.string,
          url: t.string,
          author: t.string,
          duration: t.number,
        })
      ),
    },
  ],
  async ({ gameId, sceneId, playlistName, songs }) => {
    const scene = findSceneInGameById(gameId, sceneId);

    const addedId = withinTransaction(database, () => {
      const addedPlaylist = addPlaylist(playlistName, scene.id);

      if (songs && songs.length) {
        songs.forEach(song => {
          addSong(song, addedPlaylist.id);
        });
      }

      return addedPlaylist.id;
    });

    return transformPlaylist(getPlaylistById(addedId));
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
