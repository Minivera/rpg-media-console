import { shield } from 'telefunc';

import { getLatestGameState } from './db/gamestate.js';
import { database } from './db/db.js';
import { runJSONInsertion } from './db/migrations/3_inject_db_json.js';
import { withinTransaction } from './db/utils.js';
import { deleteAllGames, exportGames } from './db/index.js';

const t = shield.type;

export const onGetPlayingState = shield(
  [
    {
      gameId: t.string,
    },
  ],
  async ({ gameId }) => {
    return getLatestGameState(Number.parseInt(gameId, 10));
  }
);

export const onImportJSONState = shield([t.string], async jsonData => {
  return withinTransaction(database, () => {
    deleteAllGames();
    runJSONInsertion(database, JSON.parse(jsonData));
  });
});

export const onExportStateAsJSON = async () => {
  return JSON.stringify(
    {
      games: JSON.parse(exportGames().games),
    },
    null,
    2
  );
};
