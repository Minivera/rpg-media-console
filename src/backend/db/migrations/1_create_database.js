export const createDatabase = {
  id: 0,
  sql: database =>
    database.exec(`
CREATE TABLE IF NOT EXISTS migrations(
  id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY, 
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  game_id INTEGER NOT NULL,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  scene_id INTEGER NOT NULL,
  FOREIGN KEY(scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  image TEXT NOT NULL,
  url TEXT NOT NULL,
  author TEXT NOT NULL,
  duration INTEGER NOT NULL,
  playlist_order INTEGER NOT NULL,
  playlist_id INTEGER NOT NULL,
  FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_states (
  id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  game_id INTEGER NOT NULL,
  parent_state_id INTEGER,
  FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_state_id) REFERENCES game_states(id) ON DELETE CASCADE
);
    `),
};
