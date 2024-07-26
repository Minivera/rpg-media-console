import { db } from '../db.js';

import { transformScene } from './transformers.js';
import { getDbGame, getDbScene } from './db.js';

export const onAddSceneToGame = async ({ gameId, sceneName }) => {
  const { _lastId } = db.data;

  const game = getDbGame(gameId);

  const newScene = {
    id: _lastId + 1,
    name: sceneName,
    playlists: [],
  };

  game.scenes.push(newScene);
  db.data._lastId++;
  await db.write();

  return newScene;
};

export const onDeleteSceneInGame = async ({ gameId, sceneId }) => {
  const game = getDbGame(gameId);

  game.scenes = game.scenes.filter(
    scene => scene.id !== Number.parseInt(sceneId, 10)
  );
  await db.write();
};

export const onUpdateSceneInGame = async ({ gameId, sceneId, sceneName }) => {
  const game = getDbGame(gameId);

  game.scenes = game.scenes.map(scene => {
    if (scene.id === Number.parseInt(sceneId, 10)) {
      return {
        ...scene,
        name: sceneName,
      };
    }

    return scene;
  });
  await db.write();
};

export const onGetSceneInGameById = async ({ gameId, sceneId }) => {
  const found = getDbScene(gameId, sceneId);
  if (!found) {
    return undefined;
  }

  return transformScene(found);
};
