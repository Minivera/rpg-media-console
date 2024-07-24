import { useEffect, useState } from 'react';
import {
  Card,
  Heading,
  Flex,
  Box,
  Spinner,
  IconButton,
  Text,
  Separator,
  Callout,
  ScrollArea,
  Grid,
} from '@radix-ui/themes';
import { TrashIcon, ViewNoneIcon } from '@radix-ui/react-icons';
import { useParams, useLocation, Link } from 'wouter';

import { onGetGameById, onUpdateGame } from '../backend/games.telefunc';
import { Navigation } from '../components/Navigation.jsx';
import { NewSceneDialog } from '../components/NewSceneDialog.jsx';
import { RenameField } from '../components/RenameField.jsx';
import { PlaylistList } from '../components/PlaylistList.jsx';
import {
  onDeleteSceneInGame,
  onGetSceneInGameById,
  onUpdateSceneInGame,
} from '../backend/scenes.telefunc.js';
import { NewPlaylistDialog } from '../components/NewPlaylistDialog.jsx';

export const SceneById = () => {
  const { gameId, sceneId } = useParams();
  const [, setLocation] = useLocation();

  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);

  useEffect(() => {
    onGetGameById({ gameId }).then(game => setGame(game));
  }, [setGame]);

  useEffect(() => {
    onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
  }, [setScene]);

  const handleRenameScene = newName => {
    onUpdateSceneInGame({ gameId, sceneId, sceneName: newName }).then(() => {
      onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
    });
  };

  if (!scene || !game) {
    return (
      <>
        <Card variant="classic">
          <Flex flexGrow="1">
            <Flex justify="center" align="center" direction="column">
              <Spinner size="3" loading />
            </Flex>
          </Flex>
        </Card>
      </>
    );
  }

  return (
    <Flex direction="column" gap="7" mt="7">
      <Box>
        <Navigation
          previousPage={`/games/${gameId}`}
          breadcrumbs={[
            {
              path: '/',
              name: 'Games',
            },
            {
              path: `/games/${gameId}`,
              name: game.name,
              active: true,
            },
            {
              name: scene.name,
              active: true,
            },
          ]}
        />
        <Separator mt="3" size="4" />
      </Box>
      <Flex direction="column" gap="3" mb="9">
        <RenameField name={scene.name} onChange={handleRenameScene} />
        <Text as="h2" size="4" color="gray">
          Click on a playlist to manage it, or create a new one to get started
        </Text>
        <Separator mt="3" size="4" />
        <Grid columns="auto 1fr" gap="3">
          <Flex direction="column" gap="3">
            <Heading as="h3" size="7">
              Playlists
            </Heading>
            <PlaylistList
              gameId={gameId}
              sceneId={scene.id}
              playlists={scene.playlists}
              onCreatePlaylist={() =>
                onGetGameById({ gameId }).then(game => {
                  setGame(game);
                })
              }
              orientation="vertical"
            />
          </Flex>
          <Card asChild>
            <Box>
              <Text color="gray" size="1">
                Select a playlist to manage its songs
              </Text>
            </Box>
          </Card>
        </Grid>
      </Flex>
    </Flex>
  );
};
