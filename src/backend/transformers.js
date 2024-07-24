export const transformPlaylist = playlist => {
  return {
    ...playlist,
    songsCount: playlist.songs.length,
    featuredSongs: playlist.songs.slice(0, 4),
  };
};

export const transformScene = scene => {
  let songsCount = 0;

  scene.playlists.forEach(playlist => {
    songsCount += playlist.songs.length;
  });

  return {
    ...scene,
    playlists: scene.playlists.map(transformPlaylist),
    songsCount,
    playlistsCount: scene.playlists.length,
  };
};

export const transformGame = game => {
  let playlistsCount = 0;
  let songsCount = 0;

  game.scenes.forEach(scene => {
    playlistsCount += scene.playlists.length;

    scene.playlists.forEach(playlist => {
      songsCount += playlist.songs.length;
    });
  });

  return {
    ...game,
    scenes: game.scenes.map(transformScene),
    scenesCount: game.scenes.length,
    songsCount,
    playlistsCount,
  };
};
