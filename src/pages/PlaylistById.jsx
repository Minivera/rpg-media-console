import { Fragment, useEffect, useState } from 'react';
import {
  Card,
  Heading,
  Flex,
  Box,
  Text,
  Separator,
  Grid,
  Button,
  ScrollArea,
  Callout,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
} from '@radix-ui/themes';
import { useParams, useLocation } from 'wouter';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  PlusIcon,
  ShuffleIcon,
  TrashIcon,
  ViewNoneIcon,
} from '@radix-ui/react-icons';

import { onGetGameById } from '../backend/games.telefunc';
import { Navigation } from '../components/Navigation.jsx';
import { RenameField } from '../components/RenameField.jsx';
import {
  LoadingPlaylistList,
  PlaylistList,
} from '../components/PlaylistList.jsx';
import { onGetSceneInGameById } from '../backend/scenes.telefunc.js';
import { DeleteDialog } from '../components/DeleteDialog.jsx';
import {
  onDeletePlaylistInScene,
  onGetPlaylistInSceneById,
  onUpdatePlaylistInScene,
} from '../backend/playlists.telefunc.js';
import { AddSongDialog } from '../components/AddSongDialog.jsx';
import { Duration } from '../components/Duration.jsx';
import {
  onDeleteSongInPlaylist,
  onRenameSongInPlaylist,
} from '../backend/songs.telefunc.js';
import { usePlaySongs } from '../player/PlayerContext.jsx';

const SongCard = ({ song, onRenameSong, onDeleteSong }) => {
  const [hovered, setHovered] = useState(false);
  const playSongs = usePlaySongs();

  return (
    <Flex
      gap="3"
      align="center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box position="relative">
        <Avatar src={song.image} fallback={song.originalName} />
        {hovered && (
          <Flex position="absolute" inset="0" justify="center" align="center">
            <IconButton
              radius="full"
              size="2"
              onClick={() => playSongs([song])}
            >
              <PlayIcon />
            </IconButton>
          </Flex>
        )}
      </Box>
      <Flex direction="column" gap="1" flexGrow="1">
        <RenameField
          name={song.name}
          onChange={newName => onRenameSong(song.id, newName)}
          asText
        />
        <Tooltip content={song.originalName}>
          <Text size="1" color="gray">
            {song.author}
          </Text>
        </Tooltip>
      </Flex>
      <Flex justify="center" align="center">
        <Duration seconds={song.duration} />
      </Flex>
      <DeleteDialog
        asIcon
        name={song.name}
        type="song"
        onConfirm={() => onDeleteSong(song.id)}
      >
        <TrashIcon />
      </DeleteDialog>
    </Flex>
  );
};

export const PlaylistById = () => {
  const [, setLocation] = useLocation();
  const { gameId, sceneId, playlistId } = useParams();
  const playSongs = usePlaySongs();

  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [playlist, setPlaylist] = useState(null);

  const [shouldShuffle, setShouldShuffle] = useState(false);

  useEffect(() => {
    onGetGameById({ gameId }).then(game => setGame(game));
    onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
    onGetPlaylistInSceneById({ gameId, sceneId, playlistId }).then(playlist =>
      setPlaylist(playlist)
    );
  }, [gameId, sceneId, playlistId, setGame, setScene, setPlaylist]);

  const handleRenamePlaylist = newName => {
    onUpdatePlaylistInScene({
      gameId,
      sceneId,
      playlistId,
      playlistName: newName,
    }).then(() => {
      onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
      onGetPlaylistInSceneById({ gameId, sceneId, playlistId }).then(playlist =>
        setPlaylist(playlist)
      );
    });
  };

  const handleDeletePlaylist = () => {
    onDeletePlaylistInScene({ gameId, sceneId, playlistId }).then(() => {
      setLocation(`/games/${gameId}/scenes/${sceneId}`);
    });
  };

  const handleRenameSong = (songId, newName) => {
    onRenameSongInPlaylist({
      gameId,
      sceneId,
      playlistId,
      songId,
      songName: newName,
    }).then(() => {
      onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
      onGetPlaylistInSceneById({ gameId, sceneId, playlistId }).then(playlist =>
        setPlaylist(playlist)
      );
    });
  };

  const handleDeleteSong = songId => {
    onDeleteSongInPlaylist({ gameId, sceneId, playlistId, songId }).then(() => {
      onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
      onGetPlaylistInSceneById({ gameId, sceneId, playlistId }).then(playlist =>
        setPlaylist(playlist)
      );
    });
  };

  const handlePlaySongs = () => {
    const songsList = [...playlist.songs];

    if (shouldShuffle) {
      for (let i = songsList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songsList[i], songsList[j]] = [songsList[j], songsList[i]];
      }
    }

    playSongs(songsList);
  };

  const isLoading = !scene || !game || !playlist;

  return (
    <Flex direction="column" gap="7" mt="7" mb="7">
      <Box>
        <Skeleton loading={isLoading}>
          <Navigation
            previousPage={`/games/${gameId}/scenes/${sceneId}`}
            breadcrumbs={[
              {
                path: '/',
                name: 'Games',
              },
              {
                path: `/games/${gameId}`,
                name: game?.name,
              },
              {
                path: `/games/${gameId}/scenes/${sceneId}`,
                name: scene?.name,
              },
              {
                name: playlist?.name,
                active: true,
              },
            ]}
          />
        </Skeleton>
        <Separator mt="3" size="4" />
      </Box>
      <Flex direction="column" gap="3" mb="9">
        <Flex direction="row" justify="between" align="center">
          {!isLoading ? (
            <RenameField name={playlist.name} onChange={handleRenamePlaylist} />
          ) : (
            <Skeleton>
              <Heading as="h1" size="8">
                loading...
              </Heading>
            </Skeleton>
          )}
          {!isLoading ? (
            <DeleteDialog
              type="playlist"
              name={playlist.name}
              onConfirm={handleDeletePlaylist}
            >
              <TrashIcon /> Delete playlist
            </DeleteDialog>
          ) : (
            <Skeleton>
              <Button>loading...</Button>
            </Skeleton>
          )}
        </Flex>
        <Text as="h2" size="4" color="gray">
          The playlist's songs will be displayed on the right, click play to get
          a song playing, or add a new song to get started.
        </Text>
        <Separator mt="3" size="4" />
        <Grid columns="auto 1fr" gap="3">
          <Flex direction="column" gap="3" maxHeight="90vh">
            <Heading as="h3" size="7">
              All playlists
            </Heading>
            {!isLoading ? (
              <PlaylistList
                gameId={gameId}
                sceneId={scene.id}
                playlists={scene.playlists}
                onCreatePlaylist={() => {
                  onGetGameById({ gameId }).then(game => setGame(game));
                  onGetSceneInGameById({ gameId, sceneId }).then(scene =>
                    setScene(scene)
                  );
                  onGetPlaylistInSceneById({
                    gameId,
                    sceneId,
                    playlistId,
                  }).then(playlist => setPlaylist(playlist));
                }}
                orientation="vertical"
              />
            ) : (
              <LoadingPlaylistList orientation="vertical" />
            )}
          </Flex>
          <Card asChild>
            <Box p="0" maxHeight="90vh">
              <Flex direction="column" height="100%" p="3" gap="3">
                <Flex direction="row" justify="between" align="center" px="2">
                  <Flex gap="3" align="center">
                    <Skeleton loading={isLoading}>
                      <Heading as="h4" size="5">
                        {playlist?.name} songs
                      </Heading>
                    </Skeleton>
                    <Skeleton loading={isLoading}>
                      <IconButton
                        variant="ghost"
                        size="1"
                        highContrast={shouldShuffle}
                        onClick={() =>
                          setShouldShuffle(shouldShuffle => !shouldShuffle)
                        }
                      >
                        <ShuffleIcon />
                      </IconButton>
                    </Skeleton>
                    <Skeleton loading={isLoading}>
                      <IconButton
                        radius="full"
                        size="1"
                        onClick={handlePlaySongs}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Skeleton>
                  </Flex>
                  {!isLoading ? (
                    <AddSongDialog
                      gameId={gameId}
                      sceneId={sceneId}
                      playlistId={playlistId}
                      onAdded={() => {
                        onGetSceneInGameById({ gameId, sceneId }).then(scene =>
                          setScene(scene)
                        );
                        onGetPlaylistInSceneById({
                          gameId,
                          sceneId,
                          playlistId,
                        }).then(playlist => setPlaylist(playlist));
                      }}
                    />
                  ) : (
                    <Skeleton>
                      <Button>
                        <PlusIcon /> Add song
                      </Button>
                    </Skeleton>
                  )}
                </Flex>
                <Separator size="4" />
                <Flex flexGrow="1" maxHeight="calc(100% - 105px)">
                  <ScrollArea size="1" scrollbars="vertical">
                    {isLoading && (
                      <Flex direction="column" px="4" gap="3">
                        {[1, 2, 3].map(index => (
                          <Fragment key={index}>
                            <Skeleton>
                              <Box width="100%" height="100px" />
                            </Skeleton>
                            {index < 3 && (
                              <Separator size="4" orientation="horizontal" />
                            )}
                          </Fragment>
                        ))}
                      </Flex>
                    )}
                    {!!playlist && !playlist.songs.length && (
                      <Callout.Root>
                        <Callout.Icon>
                          <ViewNoneIcon />
                        </Callout.Icon>
                        <Callout.Text>
                          No songs added, click the "Add song" button to get
                          started.
                        </Callout.Text>
                      </Callout.Root>
                    )}
                    <Flex direction="column" px="4" gap="3">
                      {playlist?.songs.map((song, index) => (
                        <Fragment key={song.id}>
                          <SongCard
                            song={song}
                            onRenameSong={handleRenameSong}
                            onDeleteSong={handleDeleteSong}
                          />
                          {playlist.songs.length > 1 &&
                            index < playlist.songs.length - 1 && (
                              <Separator size="4" orientation="horizontal" />
                            )}
                        </Fragment>
                      ))}
                    </Flex>
                  </ScrollArea>
                </Flex>
                {!isLoading && (playlist.previous || playlist.next) && (
                  <>
                    <Separator size="4" />
                    <Flex
                      direction="row"
                      justify="between"
                      align="center"
                      px="2"
                    >
                      {playlist.previous ? (
                        <Button
                          style={{ cursor: 'pointer' }}
                          variant="ghost"
                          onClick={() => {
                            setLocation(
                              `/games/${gameId}/scenes/${sceneId}/playlists/${playlist.previous.id}`
                            );
                          }}
                        >
                          <ArrowLeftIcon /> {playlist.previous.name}
                        </Button>
                      ) : (
                        <Box />
                      )}
                      {playlist.next ? (
                        <Button
                          style={{ cursor: 'pointer' }}
                          variant="ghost"
                          onClick={() => {
                            setLocation(
                              `/games/${gameId}/scenes/${sceneId}/playlists/${playlist.next.id}`
                            );
                          }}
                        >
                          {playlist.next.name} <ArrowRightIcon />
                        </Button>
                      ) : (
                        <Box />
                      )}
                    </Flex>
                  </>
                )}
              </Flex>
            </Box>
          </Card>
        </Grid>
      </Flex>
    </Flex>
  );
};
