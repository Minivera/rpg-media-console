export const transformPlaylist = playlist => {
  return {
    ...playlist,
    songsCount: playlist.songs.length,
    featuredSongs: playlist.songs.slice(0, 4),
  };
};

export const transformScene = (scene, playlistSearch) => {
  let songsCount = 0;

  scene.playlists.forEach(playlist => {
    songsCount += playlist.songs.length;
  });

  return {
    ...scene,
    playlists: scene.playlists
      .filter(playlist =>
        playlistSearch
          ? playlist.name.toLowerCase().includes(playlistSearch.toLowerCase())
          : true
      )
      .map(playlist => transformPlaylist(playlist)),
    songsCount,
    playlistsCount: scene.playlists.length,
  };
};

export const transformGame = (game, sceneSearch) => {
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
    scenes: game.scenes
      .filter(scene =>
        sceneSearch
          ? scene.name.toLowerCase().includes(sceneSearch.toLowerCase())
          : true
      )
      .map(scene => transformScene(scene)),
    scenesCount: game.scenes.length,
    songsCount,
    playlistsCount,
  };
};
