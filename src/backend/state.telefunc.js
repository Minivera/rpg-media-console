import { db } from '../db.js';

export const onGetPlayingState = async () => {
  return db.data.playingState;
};

export const onSavePlayingState = async playingState => {
  await db.update(data => {
    data.playingState = playingState;
  });
};

export const onApplyState = async jsonData => {
  db.data = JSON.parse(jsonData);
  await db.write();
};
