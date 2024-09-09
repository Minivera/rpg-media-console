import { useEffect, useState } from 'react';
import {
  Card,
  Heading,
  Flex,
  Box,
  Text,
  Separator,
  Grid,
  Skeleton,
  Button,
  TextField,
  IconButton,
} from '@radix-ui/themes';
import { useParams, useLocation } from 'wouter';
import {
  Cross1Icon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@radix-ui/react-icons';

import { onGetGameById } from '../backend/games.telefunc';
import { Navigation } from '../components/Navigation.jsx';
import { RenameField } from '../components/RenameField.jsx';
import {
  LoadingPlaylistList,
  PlaylistList,
} from '../components/PlaylistList.jsx';
import {
  onDeleteSceneInGame,
  onGetSceneInGameById,
  onUpdateSceneInGame,
} from '../backend/scenes.telefunc.js';
import { DeleteDialog } from '../components/DeleteDialog.jsx';
import { onGetPlaylistInSceneById } from '../backend/playlists.telefunc.js';
import { useDebouncedCallback } from 'use-debounce';

export const SceneById = () => {
  const [, setLocation] = useLocation();
  const { gameId, sceneId } = useParams();

  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    onGetGameById({ gameId }).then(game => setGame(game));
    onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
  }, [gameId, sceneId, setGame, setScene]);

  const handleSearch = searchValue => {
    setSearch(searchValue);
    onGetSceneInGameById({ gameId, sceneId, search: searchValue }).then(scene =>
      setScene(scene)
    );
  };

  const debouncedSearch = useDebouncedCallback(value => {
    handleSearch(value);
  }, 500);

  const handleRenameScene = newName => {
    onUpdateSceneInGame({ gameId, sceneId, sceneName: newName }).then(() => {
      onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
    });
  };

  const handleDeleteScene = () => {
    onDeleteSceneInGame({ gameId, sceneId }).then(() => {
      setLocation(`/games/${gameId}`);
    });
  };

  const isLoading = !scene || !game;

  return (
    <Flex direction="column" gap="7" mt="7" mb="7">
      <Box>
        <Skeleton loading={isLoading}>
          <Navigation
            previousPage={`/games/${gameId}`}
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
                name: scene?.name,
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
            <RenameField name={scene.name} onChange={handleRenameScene} />
          ) : (
            <Skeleton>
              <Heading as="h1" size="8">
                loading...
              </Heading>
            </Skeleton>
          )}
          {!isLoading ? (
            <DeleteDialog
              type="scene"
              name={scene.name}
              onConfirm={handleDeleteScene}
            >
              <TrashIcon /> Delete scene
            </DeleteDialog>
          ) : (
            <Skeleton>
              <Button>loading...</Button>
            </Skeleton>
          )}
        </Flex>
        <Text as="h2" size="4" color="gray">
          Click on a playlist to manage it, or create a new one to get started
        </Text>
        <Separator mt="3" size="4" />
        <Grid
          columns={{
            md: 'calc(185px + var(--space-3) * 4) 1fr',
            initial: '1fr 0px',
          }}
          gap="3"
        >
          <Flex
            direction="column"
            gap="3"
            maxHeight={{ md: 'calc(100vh + 25px)', initial: 'unset' }}
            align={{ md: 'start', initial: 'center' }}
            mb={{ md: '0', initial: '7' }}
          >
            <Heading as="h3" size="7">
              All playlists
            </Heading>
            <Box pr="3" width={{ initial: '100%', md: 'unset' }}>
              <TextField.Root
                placeholder="Search playlists..."
                disabled={isLoading}
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  debouncedSearch(event.target.value);
                }}
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
                {!!search && (
                  <TextField.Slot>
                    <IconButton
                      size="1"
                      variant="ghost"
                      onClick={() => handleSearch('')}
                    >
                      <Cross1Icon height="14" width="14" />
                    </IconButton>
                  </TextField.Slot>
                )}
              </TextField.Root>
            </Box>
            {!isLoading ? (
              <PlaylistList
                gameId={gameId}
                sceneId={scene.id}
                playlists={scene.playlists}
                onCreatePlaylist={() =>
                  onGetSceneInGameById({ gameId, sceneId }).then(scene =>
                    setScene(scene)
                  )
                }
                orientation="vertical"
              />
            ) : (
              <LoadingPlaylistList orientation="vertical" />
            )}
          </Flex>
          <Card asChild>
            <Box mb="9" display={{ initial: 'none', sm: 'block' }}>
              <Skeleton loading={isLoading}>
                <Text color="gray" size="1">
                  Select a playlist to manage its songs
                </Text>
              </Skeleton>
            </Box>
          </Card>
        </Grid>
      </Flex>
    </Flex>
  );
};
