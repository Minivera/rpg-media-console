import { JSONFilePreset } from 'lowdb/node';

export const db = await JSONFilePreset('db.json', {
  _lastId: 0,
  playingState: {
    playing: false,
    currentIndex: 0,
    songs: [],
  },
  games: [],
});
