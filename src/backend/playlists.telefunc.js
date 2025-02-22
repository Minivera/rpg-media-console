import { shield } from 'telefunc';

import { db } from '../db.js';

import { transformPlaylist } from './transformers.js';
import { getDbPlaylist, getDbScene } from './db.js';

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
    const { _lastId } = db.data;

    const scene = getDbScene(gameId, sceneId);

    const newPlaylist = {
      id: _lastId + 1,
      name: playlistName,
      songs: [],
    };

    scene.playlists.push(newPlaylist);
    db.data._lastId++;
    await db.write();

    return newPlaylist;
  }
);

export const onDeletePlaylistInScene = shield(
  [{ gameId: t.string, sceneId: t.string, playlistId: t.string }],
  async ({ gameId, sceneId, playlistId }) => {
    const scene = getDbScene(gameId, sceneId);

    scene.playlists = scene.playlists.filter(
      playlist => playlist.id !== Number.parseInt(playlistId, 10)
    );
    await db.write();
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
    const scene = getDbScene(gameId, sceneId);

    scene.playlists = scene.playlists.map(playlist => {
      if (playlist.id === Number.parseInt(playlistId, 10)) {
        return {
          ...playlist,
          name: playlistName,
        };
      }

      return playlist;
    });
    await db.write();
  }
);

export const onGetPlaylistInSceneById = shield(
  [{ gameId: t.string, sceneId: t.string, playlistId: t.string }],
  async ({ gameId, sceneId, playlistId }) => {
    const scene = getDbScene(gameId, sceneId);
    if (!scene) {
      return undefined;
    }

    const found = getDbPlaylist(gameId, sceneId, playlistId);
    if (!found) {
      return undefined;
    }

    const currentId = scene.playlists.findIndex(
      playlist => playlist.id === found.id
    );

    return {
      ...transformPlaylist(found),
      previous: currentId > 0 ? scene.playlists[currentId - 1] : undefined,
      next:
        currentId < scene.playlists.length - 1
          ? scene.playlists[currentId + 1]
          : undefined,
    };
  }
);
