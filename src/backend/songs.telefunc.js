import { db } from '../db.js';

import { getDbPlaylist } from './db.js';

export const onAddSongToPlaylist = async ({
  gameId,
  sceneId,
  playlistId,
  songData,
}) => {
  const { _lastId } = db.data;

  const playlist = getDbPlaylist(gameId, sceneId, playlistId);

  const newSong = {
    id: _lastId + 1,
    ...songData,
  };

  playlist.songs.push(newSong);
  db.data._lastId++;
  await db.write();

  return newSong;
};

export const onRenameSongInPlaylist = async ({
  gameId,
  sceneId,
  playlistId,
  songId,
  songName,
}) => {
  const playlist = getDbPlaylist(gameId, sceneId, playlistId);

  playlist.songs = playlist.songs.map(song => {
    if (song.id === Number.parseInt(songId, 10)) {
      return {
        ...song,
        name: songName,
      };
    }

    return song;
  });
  await db.write();
};

export const onUpdateSongOrder = async ({
  gameId,
  sceneId,
  playlistId,
  songs,
}) => {
  const playlist = getDbPlaylist(gameId, sceneId, playlistId);

  playlist.songs = songs;
  await db.write();
};

export const onDeleteSongInPlaylist = async ({
  gameId,
  sceneId,
  playlistId,
  songId,
}) => {
  const playlist = getDbPlaylist(gameId, sceneId, playlistId);

  playlist.songs = playlist.songs.filter(
    song => song.id !== Number.parseInt(songId, 10)
  );
  await db.write();
};
