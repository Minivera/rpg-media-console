import { db } from '../db.js';
import { transformGame } from './transformers.js';
import { getDbGame } from './db.js';

export const onGetGames = async () => {
  const { games } = db.data;

  return games.map(transformGame);
};

export const onAddGame = async ({ gameName }) => {
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
};

export const onDeleteGame = async ({ gameId }) => {
  db.data.games = db.data.games.filter(
    game => game.id !== Number.parseInt(gameId, 10)
  );
  await db.write();
};

export const onUpdateGame = async ({ gameId, gameName }) => {
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
};

export const onGetGameById = async ({ gameId }) => {
  const found = getDbGame(gameId);
  if (!found) {
    return undefined;
  }

  return transformGame(found);
};
