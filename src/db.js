import { JSONFilePreset } from 'lowdb/node';

const dbPath = process.env.SERVER_DB_PATH;

export const db = await JSONFilePreset(dbPath, {
  _lastId: 0,
  playingState: {
    playing: false,
    currentIndex: 0,
    songs: [],
  },
  games: [],
});
