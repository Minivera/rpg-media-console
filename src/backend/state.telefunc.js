import { shield } from 'telefunc';

import { db } from './db/index.js';

const t = shield.type;

export const onGetPlayingState = async () => {
  await db.read();
  return db.data.playingState;
};

export const onApplyState = shield([t.string], async jsonData => {
  db.data = JSON.parse(jsonData);
  await db.write();
});
