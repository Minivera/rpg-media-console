import { shield } from 'telefunc';

import { getLatestGameState } from './db/gamestate.js';

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
