import { db } from '../db.js';

import { onGetGameById } from './games.telefunc.js';

export const onAddSceneToGame = async ({ gameId, sceneName }) => {
  const { _lastId } = db.data;

  const game = await onGetGameById({ gameId });

  const newScene = {
    id: _lastId + 1,
    name: sceneName,
    playlists: [],
  };

  game.scenes.push(newScene);
  await db.write();

  return newScene;
};

export const onDeleteSceneInGame = async ({ gameId, sceneId }) => {
  const game = await onGetGameById({ gameId });

  game.scenes = game.scenes.filter(
    scene => scene.id !== Number.parseInt(sceneId, 10)
  );
  await db.write();
};

export const onUpdateSceneInGame = async ({ gameId, sceneId, SceneName }) => {
  const game = await onGetGameById({ gameId });

  game.scenes = game.scenes.map(scene => {
    if (scene.id === Number.parseInt(sceneId, 10)) {
      return {
        ...scene,
        name: SceneName,
      };
    }

    return scene;
  });
  await db.write();
};

export const onGetSceneInGameById = async ({ gameId, sceneId }) => {
  const game = await onGetGameById({ gameId });

  return game.scenes.find(scene => scene.id === Number.parseInt(sceneId, 10));
};
