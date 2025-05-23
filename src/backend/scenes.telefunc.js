import { shield } from 'telefunc';

import { addScene, deleteScene, updateScene } from './db/index.js';
import { transformScene } from './utils/transformers.js';
import { findGameById, findSceneInGameById } from './utils.telefunc.js';

const t = shield.type;

export const onAddSceneToGame = shield(
  [{ gameId: t.string, sceneName: t.string }],
  async ({ gameId, sceneName }) => {
    const game = findGameById(gameId);

    return transformScene(addScene(sceneName, game.id));
  }
);

export const onDeleteSceneInGame = shield(
  [{ gameId: t.string, sceneId: t.string }],
  async ({ gameId, sceneId }) => {
    const scene = findSceneInGameById(gameId, sceneId);

    deleteScene(scene.id);
  }
);

export const onUpdateSceneInGame = shield(
  [{ gameId: t.string, sceneId: t.string, sceneName: t.string }],
  async ({ gameId, sceneId, sceneName }) => {
    const scene = findSceneInGameById(gameId, sceneId);

    return transformScene(updateScene(scene.id, sceneName));
  }
);

export const onGetSceneInGameById = shield(
  [{ gameId: t.string, sceneId: t.string, search: t.optional(t.string) }],
  async ({ gameId, sceneId, search }) => {
    const scene = findSceneInGameById(gameId, sceneId, search);

    return transformScene(scene);
  }
);
