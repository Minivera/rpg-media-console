import { db } from '../db.js';

export const onGetPlayingState = async () => {
  return db.data.playingState;
};

export const onSavePlayingState = async playingState => {
  await db.update(data => {
    data.playingState = playingState;
  });
};
