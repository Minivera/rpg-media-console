import { createPortal } from 'react-dom';
import { Fragment, useContext, useEffect, useState } from 'react';
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
  Link,
} from '@radix-ui/themes';
import { useParams, useLocation } from 'wouter';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DoubleArrowDownIcon,
  ExternalLinkIcon,
  PlayIcon,
  PlusIcon,
  ShuffleIcon,
  TrashIcon,
  ViewNoneIcon,
} from '@radix-ui/react-icons';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

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
  onUpdateSongOrder,
} from '../backend/songs.telefunc.js';
import { PlayerContext, usePlaySongs } from '../player/PlayerContext.jsx';
import { getNewPlaylistURL, getYoutubeId } from '../player/youtubeIds.js';
import { useIsBreakpoint } from '../hooks/useBreakpoints.jsx';

const SongCard = ({ song, index, onRenameSong, onDeleteSong, onPlaySong }) => {
  const [hovered, setHovered] = useState(false);
  const playerContext = useContext(PlayerContext);

  if (!playerContext) {
    throw new Error('Wrap the app inside a PlayerProvider component');
  }

  const playingSong = playerContext.songs[playerContext.currentIndex];

  const isMd = useIsBreakpoint('md');

  return (
    <Draggable draggableId={`${song.id}`} index={index}>
      {(provided, snapshot) => {
        let Parent = Fragment;
        let props = {};
        if (snapshot.isDragging) {
          Parent = Card;
          props = {
            style: {
              backgroundColor: `gray`,
            },
          };
        }

        console.log(provided.draggableProps, provided.dragHandleProps);
        const child = (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            p="1"
            px="4"
            style={{
              borderRadius: 'var(--radius-2)',
              backgroundColor:
                playingSong && playingSong.id === song.id
                  ? 'var(--orange-3)'
                  : 'unset',
              ...provided.draggableProps.style,
            }}
          >
            <Parent {...props}>
              <Flex
                gap="3"
                align="center"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {!isMd && (
                  <IconButton
                    radius="full"
                    size="1"
                    ml="-4"
                    onClick={() => onPlaySong(song)}
                  >
                    <PlayIcon />
                  </IconButton>
                )}
                <Tooltip content={song.originalName}>
                  <Box position="relative">
                    <Avatar src={song.image} fallback={song.originalName} />
                    {hovered && isMd && (
                      <Flex
                        position="absolute"
                        inset="0"
                        justify="center"
                        align="center"
                      >
                        <IconButton
                          radius="full"
                          size="2"
                          onClick={() => onPlaySong(song)}
                        >
                          <PlayIcon />
                        </IconButton>
                      </Flex>
                    )}
                  </Box>
                </Tooltip>
                <Flex direction="column" gap="1" flexGrow="1">
                  <RenameField
                    name={song.name}
                    onChange={newName => onRenameSong(song.id, newName)}
                    asText
                  />
                  <Text size="1" color="gray">
                    {song.author}
                  </Text>
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
            </Parent>
          </Box>
        );

        if (snapshot.isDragging) {
          return createPortal(child, document.querySelector('#container'));
        }

        return child;
      }}
    </Draggable>
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
  const [shouldPlaySingle, setShouldPlaySingle] = useState(false);

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

  const handleReorderSongs = result => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    const newSongs = Array.from(playlist.songs);
    const [removed] = newSongs.splice(startIndex, 1);
    newSongs.splice(endIndex, 0, removed);

    setPlaylist(playlist => ({
      ...playlist,
      songs: newSongs,
    }));

    onUpdateSongOrder({ gameId, sceneId, playlistId, songs: newSongs }).then(
      () => {
        onGetSceneInGameById({ gameId, sceneId }).then(scene =>
          setScene(scene)
        );
        onGetPlaylistInSceneById({ gameId, sceneId, playlistId }).then(
          playlist => setPlaylist(playlist)
        );
      }
    );
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

  const handlePlaySong = song => {
    if (shouldPlaySingle) {
      playSongs([song]);
      return;
    }

    if (!shouldShuffle) {
      playSongs(
        playlist.songs.slice(playlist.songs.findIndex(el => el.id === song.id))
      );
    } else {
      const songsList = playlist.songs.filter(el => el.id !== song.id);

      for (let i = songsList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songsList[i], songsList[j]] = [songsList[j], songsList[i]];
      }

      playSongs([song, ...songsList]);
    }
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
      <Flex direction="column" gap="3">
        <Flex direction="row" justify="between" align="center" gap="2">
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
        <Grid columns={{ md: 'auto 1fr', initial: '1fr' }} gap="3">
          <Flex
            direction="column"
            gap="3"
            maxHeight="calc(100vh + 50px)"
            display={{ md: 'flex', initial: 'none' }}
          >
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
            <Box
              p="0"
              mb="9"
              maxHeight={{ md: '90vh', initial: 'unset' }}
              minHeight={{ md: 'auto', initial: '58vh' }}
            >
              <Flex direction="column" height="100%" p="3" gap="3">
                <Flex
                  direction="row"
                  justify="between"
                  align="center"
                  px="2"
                  gap="2"
                >
                  <Flex gap="3" align="center">
                    <Skeleton loading={isLoading}>
                      <Heading as="h4" size="5">
                        {playlist?.name} songs
                      </Heading>
                    </Skeleton>
                    <Skeleton loading={isLoading}>
                      <Tooltip content="When enabled, will shuffle the list of songs when playing">
                        <IconButton
                          variant="ghost"
                          size="1"
                          color={shouldShuffle ? 'orange' : 'gray'}
                          highContrast={shouldShuffle}
                          onClick={() =>
                            setShouldShuffle(shouldShuffle => !shouldShuffle)
                          }
                        >
                          <ShuffleIcon />
                        </IconButton>
                      </Tooltip>
                    </Skeleton>
                    <Skeleton loading={isLoading}>
                      <Tooltip content="When enabled, will play the remaining songs in the playlist after the selected song">
                        <IconButton
                          variant="ghost"
                          size="1"
                          color={shouldPlaySingle ? 'gray' : 'orange'}
                          highContrast={!shouldPlaySingle}
                          onClick={() =>
                            setShouldPlaySingle(
                              shouldPlaySingle => !shouldPlaySingle
                            )
                          }
                        >
                          <DoubleArrowDownIcon />
                        </IconButton>
                      </Tooltip>
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
                    {!isLoading && (
                      <DragDropContext onDragEnd={handleReorderSongs}>
                        <Droppable droppableId="list">
                          {provided => (
                            <Flex
                              direction="column"
                              gap="2"
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              {playlist.songs.map((song, index) => (
                                <SongCard
                                  key={song.id}
                                  song={song}
                                  index={index}
                                  onRenameSong={handleRenameSong}
                                  onDeleteSong={handleDeleteSong}
                                  onPlaySong={handlePlaySong}
                                />
                              ))}
                              {provided.placeholder}
                            </Flex>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </ScrollArea>
                </Flex>
                {!isLoading && (playlist.previous || playlist.next) && (
                  <>
                    <Separator size="4" />
                    <Grid columns="33% 33% 33%" px="2">
                      {playlist.previous && (
                        <Flex justify="start" align="center" gridColumn="1">
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
                        </Flex>
                      )}
                      {playlist.songs.length > 0 && (
                        <Flex justify="center" align="center" gridColumn="2">
                          <Link
                            href={getNewPlaylistURL(
                              playlist.songs.map(song => getYoutubeId(song.url))
                            )}
                            target="_blank"
                          >
                            Play on youtube <ExternalLinkIcon />
                          </Link>
                        </Flex>
                      )}
                      {playlist.next && (
                        <Flex justify="end" align="center" gridColumn="3">
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
                        </Flex>
                      )}
                    </Grid>
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
