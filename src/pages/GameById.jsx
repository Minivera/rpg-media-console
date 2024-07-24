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
} from '@radix-ui/themes';
import { TrashIcon, ViewNoneIcon } from '@radix-ui/react-icons';
import { useParams, useLocation, Link } from 'wouter';

import { onGetGameById, onUpdateGame } from '../backend/games.telefunc';
import { Navigation } from '../components/Navigation.jsx';
import { NewSceneDialog } from '../components/NewSceneDialog.jsx';
import { RenameField } from '../components/RenameField.jsx';
import { PlaylistList } from '../components/PlaylistList.jsx';
import { onDeleteSceneInGame } from '../backend/scenes.telefunc.js';

export const GameById = () => {
  const { gameId } = useParams();
  const [, setLocation] = useLocation();

  const [game, setGame] = useState(null);

  useEffect(() => {
    onGetGameById({ gameId }).then(game => setGame(game));
  }, [setGame]);

  const handleRenameGame = newName => {
    onUpdateGame({ gameId, gameName: newName }).then(() => {
      onGetGameById({ gameId }).then(game => {
        setGame(game);
      });
    });
  };

  const handleDeleteScene = sceneId => {
    onDeleteSceneInGame({ gameId, sceneId }).then(() => {
      onGetGameById({ gameId }).then(game => {
        setGame(game);
      });
    });
  };

  if (!game) {
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
          previousPage="/"
          breadcrumbs={[
            {
              path: '/',
              name: 'Games',
            },
            {
              name: game.name,
              active: true,
            },
          ]}
        />
        <Separator mt="3" size="4" />
      </Box>
      <Flex direction="column" gap="3" mb="9">
        <RenameField name={game.name} onChange={handleRenameGame} />
        <Text as="h2" size="4" color="gray">
          Select the scene you want to manage, or create a new one to get
          started.
        </Text>
        <Separator mt="3" size="4" />
        <Flex direction="row" gap="3" justify="between" align="center">
          <Heading as="h3" size="7">
            Your scenes
          </Heading>
          <NewSceneDialog
            gameId={gameId}
            onCreated={created => {
              setLocation(`/games/${gameId}/scene/${created.id}`);
            }}
          />
        </Flex>
        <Text as="h3" size="2" color="gray" mb="3">
          Manage the scenes for your games by clicking on their title or any of
          their playlists.
        </Text>
        {!game.scenes.length && (
          <Callout.Root>
            <Callout.Icon>
              <ViewNoneIcon />
            </Callout.Icon>
            <Callout.Text>
              No scenes created, click the "New scene" button to get started.
            </Callout.Text>
          </Callout.Root>
        )}
        {game.scenes.map(scene => (
          <Flex key={scene.id} gap="2" direction="column">
            <Flex direction="row" gap="3" align="center">
              <Heading as="h4" size="6" color="white">
                <Link
                  to={`/games/${gameId}/scene/${scene.id}`}
                  style={{ color: 'inherit' }}
                >
                  {scene.name}
                </Link>
              </Heading>
              <IconButton
                variant="ghost"
                onClick={() => handleDeleteScene(scene.id)}
                style={{ cursor: 'pointer' }}
              >
                <TrashIcon width="18" height="18" />
              </IconButton>
            </Flex>
            <PlaylistList
              gameId={gameId}
              sceneId={scene.id}
              playlists={scene.playlists}
              onCreatePlaylist={() =>
                onGetGameById({ gameId }).then(game => {
                  setGame(game);
                })
              }
            />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
