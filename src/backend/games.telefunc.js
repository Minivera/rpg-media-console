import { shield } from 'telefunc';

import { db } from '../db.js';

import { transformGame } from './transformers.js';
import { getDbGame } from './db.js';

const t = shield.type;

export const onGetGames = shield(
  [t.optional({ search: t.optional(t.string) })],
  async ({ search } = {}) => {
    const { games } = db.data;

    return games
      .filter(game =>
        search ? game.name.toLowerCase().includes(search.toLowerCase()) : true
      )
      .map(game => transformGame(game));
  }
);

export const onAddGame = shield(
  [{ gameName: t.string }],
  async ({ gameName }) => {
    const { _lastId } = db.data;

    const newGame = {
      id: _lastId + 1,
      name: gameName,
      scenes: [],
    };

    await db.update(data => {
      data._lastId++;
      data.games.push(newGame);
    });

    return newGame;
  }
);

export const onDeleteGame = shield(
  [{ gameId: t.string }],
  async ({ gameId }) => {
    db.data.games = db.data.games.filter(
      game => game.id !== Number.parseInt(gameId, 10)
    );
    await db.write();
  }
);

export const onUpdateGame = shield(
  [{ gameId: t.string, gameName: t.string }],
  async ({ gameId, gameName }) => {
    db.data.games = db.data.games.map(game => {
      if (game.id === Number.parseInt(gameId, 10)) {
        return {
          ...game,
          name: gameName,
        };
      }

      return game;
    });
    await db.write();
  }
);

export const onGetGameById = shield(
  [{ gameId: t.string, search: t.optional(t.string) }],
  async ({ gameId, search }) => {
    const found = getDbGame(gameId);
    if (!found) {
      return undefined;
    }

    return transformGame(found, search);
  }
);
