import { Abort } from 'telefunc';

import { getGameById, getPlaylistById, getSceneById } from './db/index.js';
import { getSongById } from './db/songs.js';

export const findGameById = gameId => {
  const game = getGameById(Number.parseInt(gameId, 10));
  if (!game) {
    throw Abort({
      errorMessage: `game ${gameId} not found`,
    });
  }

  return game;
};

export const findSceneInGameById = (gameId, sceneId, playlistSearch) => {
  const game = findGameById(gameId);

  const scene = getSceneById(
    Number.parseInt(sceneId, 10),
    true,
    playlistSearch
  );
  if (!scene) {
    throw Abort({
      errorMessage: `scene ${sceneId} not found`,
    });
  }

  if (scene.game_id !== game.id) {
    throw Abort({
      errorMessage: `scene ${sceneId} not found`,
    });
  }

  return scene;
};

export const findPlaylistInSceneById = (gameId, sceneId, playlistId) => {
  const scene = findSceneInGameById(gameId, sceneId);

  const playlist = getPlaylistById(Number.parseInt(playlistId, 10), true);
  if (!playlist) {
    throw Abort({
      errorMessage: `playlist ${playlistId} not found`,
    });
  }

  if (playlist.scene_id !== scene.id) {
    throw Abort({
      errorMessage: `playlist ${playlistId} not found`,
    });
  }

  return playlist;
};

export const findSongInPlaylistById = (gameId, sceneId, playlistId, songId) => {
  const playlist = findPlaylistInSceneById(gameId, sceneId, playlistId);

  const song = getSongById(Number.parseInt(songId, 10), true);
  if (!song) {
    throw Abort({
      errorMessage: `song ${songId} not found`,
    });
  }

  if (song.playlist_id !== playlist.id) {
    throw Abort({
      errorMessage: `song ${songId} not found`,
    });
  }

  return song;
};
