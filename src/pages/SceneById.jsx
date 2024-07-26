import { useEffect, useState } from 'react';
import {
  Card,
  Heading,
  Flex,
  Box,
  Spinner,
  Text,
  Separator,
  Grid,
} from '@radix-ui/themes';
import { useParams, useLocation } from 'wouter';
import { TrashIcon } from '@radix-ui/react-icons';

import { onGetGameById } from '../backend/games.telefunc';
import { Navigation } from '../components/Navigation.jsx';
import { RenameField } from '../components/RenameField.jsx';
import { PlaylistList } from '../components/PlaylistList.jsx';
import {
  onDeleteSceneInGame,
  onGetSceneInGameById,
  onUpdateSceneInGame,
} from '../backend/scenes.telefunc.js';
import { DeleteDialog } from '../components/DeleteDialog.jsx';

export const SceneById = () => {
  const [, setLocation] = useLocation();
  const { gameId, sceneId } = useParams();

  const [game, setGame] = useState(null);
  const [scene, setScene] = useState(null);

  useEffect(() => {
    onGetGameById({ gameId }).then(game => setGame(game));
    onGetSceneInGameById({ gameId, sceneId }).then(scene => setScene(scene));
  }, [gameId, sceneId, setGame, setScene]);

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
        <Flex direction="row" justify="between" align="center">
          <RenameField name={scene.name} onChange={handleRenameScene} />
          <DeleteDialog
            type="scene"
            name={scene.name}
            onConfirm={handleDeleteScene}
          >
            <TrashIcon /> Delete scene
          </DeleteDialog>
        </Flex>
        <Text as="h2" size="4" color="gray">
          Click on a playlist to manage it, or create a new one to get started
        </Text>
        <Separator mt="3" size="4" />
        <Grid columns="auto 1fr" gap="3">
          <Flex direction="column" gap="3" maxHeight="90vh">
            <Heading as="h3" size="7">
              Playlists
            </Heading>
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
