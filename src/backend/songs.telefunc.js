import { shield } from 'telefunc';

import {
  findGameById,
  findPlaylistInSceneById,
  findSongInPlaylistById,
} from './utils.telefunc.js';
import { transformSong } from './utils/transformers.js';
import {
  addSong,
  deleteSong,
  getSongs,
  updateSong,
  updateSongsOrder,
} from './db/index.js';

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
    const playlist = findPlaylistInSceneById(gameId, sceneId, playlistId);

    return transformSong(addSong(songData, playlist.id));
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
    const song = findPlaylistInSceneById(gameId, sceneId, playlistId, songId);

    return transformSong(updateSong({ name: songName }, song.id));
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
    findPlaylistInSceneById(gameId, sceneId, playlistId);

    updateSongsOrder(songs);
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
    const song = findSongInPlaylistById(gameId, sceneId, playlistId, songId);

    deleteSong(song.id);
  }
);

export const onGetAllGameSongs = shield(
  [{ gameId: t.string, search: t.optional(t.string) }],
  async ({ gameId, search }) => {
    const game = findGameById(gameId);

    return getSongs({ search, gameId: game.id }).map(transformSong);
  }
);
