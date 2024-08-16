import { shield } from 'telefunc';

import { db } from '../db.js';

import { getDbPlaylist } from './db.js';

const t = shield.type;

export const onAddSongToPlaylist = shield(
  [
    {
      gameId: t.string,
      sceneId: t.string,
      playlistId: t.string,
      songData: {
        originalName: t.string,
        name: t.string,
        image: t.string,
        url: t.string,
        author: t.string,
        duration: t.number,
      },
    },
  ],
  async ({ gameId, sceneId, playlistId, songData }) => {
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
  }
);

export const onRenameSongInPlaylist = shield(
  [
    {
      gameId: t.string,
      sceneId: t.string,
      playlistId: t.string,
      songId: t.or(t.string, t.number),
      songName: t.string,
    },
  ],
  async ({ gameId, sceneId, playlistId, songId, songName }) => {
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
  }
);

export const onUpdateSongOrder = shield(
  [
    {
      gameId: t.string,
      sceneId: t.string,
      playlistId: t.string,
      songs: t.array({
        id: t.number,
        originalName: t.string,
        name: t.string,
        image: t.string,
        url: t.string,
        author: t.string,
        duration: t.number,
      }),
    },
  ],
  async ({ gameId, sceneId, playlistId, songs }) => {
    const playlist = getDbPlaylist(gameId, sceneId, playlistId);

    playlist.songs = songs;
    await db.write();
  }
);

export const onDeleteSongInPlaylist = shield(
  [
    {
      gameId: t.string,
      sceneId: t.string,
      playlistId: t.string,
      songId: t.or(t.string, t.number),
    },
  ],
  async ({ gameId, sceneId, playlistId, songId }) => {
    const playlist = getDbPlaylist(gameId, sceneId, playlistId);

    playlist.songs = playlist.songs.filter(
      song => song.id !== Number.parseInt(songId, 10)
    );
    await db.write();
  }
);
