import { database } from './db.js';
import { withinTransaction } from './utils.js';

export const getLatestGameState = gameId => {
  return database
    .prepare(
      `
        SELECT
          id,
          data,
          game_id
        FROM game_states
        WHERE game_id = ?
        ORDER BY id DESC
        LIMIT 1;
`
    )
    .get(gameId);
};

export const initializeGameState = (gameId, data) => {
  return withinTransaction(database, () => {
    return database
      .prepare(
        `
          INSERT INTO game_states (data, game_id)
          VALUES (?, ?)
          RETURNING id, data, game_id;
        `
      )
      .get(data, gameId);
  });
};

export const startNewGameState = (gameId, stateId, data) => {
  return withinTransaction(database, () => {
    return database
      .prepare(
        `
          INSERT INTO game_states (data, game_id, parent_state_id)
          VALUES(?, ?, ?)
          RETURNING id, data, game_id;
        `
      )
      .get(data, gameId, stateId);
  });
};

export const updateExistingGameState = (stateId, data) => {
  return withinTransaction(database, () => {
    return database
      .prepare(
        `
          UPDATE game_states
          SET data = ?
          WHERE id = ?;
        `
      )
      .get(data, stateId);
  });
};
