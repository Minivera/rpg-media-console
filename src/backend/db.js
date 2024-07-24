import { db } from '../db.js';

export const getDbGame = gameId => {
  const { games } = db.data;

  return games.find(game => game.id === Number.parseInt(gameId, 10));
};

export const getDbScene = (gameId, sceneId) => {
  const game = getDbGame(gameId);

  return game.scenes.find(scene => scene.id === Number.parseInt(sceneId, 10));
};

export const getDbPlaylist = (gameId, sceneId, playlistId) => {
  const scene = getDbScene(gameId, sceneId);

  return scene.playlists.find(
    playlist => playlist.id === Number.parseInt(playlistId, 10)
  );
};
