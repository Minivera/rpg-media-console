import { shield } from 'telefunc';

import {
  getGames,
  addGame,
  updateGame,
  deleteGame,
  getScenes,
} from './db/index.js';
import { transformGame, transformScene } from './utils/transformers.js';
import { findGameById } from './utils.telefunc.js';

const t = shield.type;

export const onGetGames = shield(
  [t.optional({ search: t.optional(t.string) })],
  async ({ search } = {}) => {
    const games = getGames({ search });

    return games.map(transformGame);
  }
);

export const onAddGame = shield(
  [{ gameName: t.string }],
  async ({ gameName }) => {
    const addedGame = addGame(gameName);

    return transformGame(addedGame);
  }
);

export const onDeleteGame = shield(
  [{ gameId: t.string }],
  async ({ gameId }) => {
    const game = findGameById(gameId);

    deleteGame(game.id);
  }
);

export const onUpdateGame = shield(
  [{ gameId: t.string, gameName: t.string }],
  async ({ gameId, gameName }) => {
    const game = findGameById(gameId);

    const updatedGame = updateGame(game.id, gameName);

    return transformGame(updatedGame);
  }
);

export const onGetGameById = shield(
  [{ gameId: t.string, search: t.optional(t.string) }],
  async ({ gameId, search }) => {
    const found = findGameById(gameId);

    const scenes = getScenes({ search, gameId: found.id, withPlaylists: true });

    return {
      ...transformGame(found),
      scenes: scenes.map(transformScene),
    };
  }
);
