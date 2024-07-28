import { shield } from 'telefunc';

import { db } from '../db.js';

import { transformScene } from './transformers.js';
import { getDbGame, getDbScene } from './db.js';

const t = shield.type;

export const onAddSceneToGame = shield(
  [{ gameId: t.string, sceneName: t.string }],
  async ({ gameId, sceneName }) => {
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
  }
);

export const onDeleteSceneInGame = shield(
  [{ gameId: t.string, sceneId: t.string }],
  async ({ gameId, sceneId }) => {
    const game = getDbGame(gameId);

    game.scenes = game.scenes.filter(
      scene => scene.id !== Number.parseInt(sceneId, 10)
    );
    await db.write();
  }
);

export const onUpdateSceneInGame = shield(
  [{ gameId: t.string, sceneId: t.string, sceneName: t.string }],
  async ({ gameId, sceneId, sceneName }) => {
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
  }
);

export const onGetSceneInGameById = shield(
  [{ gameId: t.string, sceneId: t.string }],
  async ({ gameId, sceneId }) => {
    const found = getDbScene(gameId, sceneId);
    if (!found) {
      return undefined;
    }

    return transformScene(found);
  }
);
