import { shield } from 'telefunc';

import { db } from '../db.js';

const t = shield.type;

export const onGetPlayingState = async () => {
  return db.data.playingState;
};

export const onSavePlayingState = shield([t.any], async playingState => {
  await db.update(data => {
    data.playingState = playingState;
  });
});

export const onApplyState = shield([t.string], async jsonData => {
  db.data = JSON.parse(jsonData);
  await db.write();
});
