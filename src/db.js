import { JSONFilePreset } from 'lowdb/node';

export let db;

if (import.meta.env.SSR) {
  const dbPath = process.env.SERVER_DB_PATH;

  db = await JSONFilePreset(dbPath, {
    _lastId: 0,
    playingState: {
      playing: false,
      currentIndex: 0,
      songs: [],
    },
    games: [],
  });
}
