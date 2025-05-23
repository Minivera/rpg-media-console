export const transformSong = song => {
  return {
    id: song.id,
    originalName: song.name,
    name: song.display_name,
    author: song.author,
    image: song.image,
    url: song.url,
    duration: song.duration,
  };
};

export const transformPlaylist = playlist => {
  return {
    id: playlist.id,
    name: playlist.name,
    songsCount: playlist.songs_count || 0,
    songs: (playlist.songs || []).map(transformSong),
    featuredSongs: (playlist.featured_songs || []).map(transformSong),
    previous: playlist.previous
      ? transformPlaylist(playlist.previous)
      : undefined,
    next: playlist.next ? transformPlaylist(playlist.next) : undefined,
  };
};

export const transformScene = scene => {
  return {
    id: scene.id,
    name: scene.name,
    playlists: (scene.playlists || []).map(transformPlaylist),
    playlistsCount: scene.playlists_count || 0,
    songsCount: scene.songs_count || 0,
  };
};

export const transformGame = game => {
  return {
    id: game.id,
    name: game.name,
    scenesCount: game.scenes_count || 0,
    playlistsCount: game.playlists_count || 0,
    songsCount: game.songs_count || 0,
  };
};
