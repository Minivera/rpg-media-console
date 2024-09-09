import { useEffect, useState } from 'react';
import {
  Heading,
  Flex,
  Box,
  Text,
  Separator,
  Callout,
  Skeleton,
  Button,
} from '@radix-ui/themes';
import { TrashIcon, ViewNoneIcon } from '@radix-ui/react-icons';
import { useParams, useLocation, Link } from 'wouter';

import {
  onDeleteGame,
  onGetGameById,
  onUpdateGame,
} from '../backend/games.telefunc';
import { Navigation } from '../components/Navigation.jsx';
import { NewSceneDialog } from '../components/NewSceneDialog.jsx';
import { RenameField } from '../components/RenameField.jsx';
import {
  LoadingPlaylistList,
  PlaylistList,
} from '../components/PlaylistList.jsx';
import { DeleteDialog } from '../components/DeleteDialog.jsx';

export const GameById = () => {
  const { gameId } = useParams();
  const [, setLocation] = useLocation();

  const [game, setGame] = useState(null);

  useEffect(() => {
    onGetGameById({ gameId }).then(game => setGame(game));
  }, [gameId, setGame]);

  const handleRenameGame = newName => {
    onUpdateGame({ gameId, gameName: newName }).then(() => {
      onGetGameById({ gameId }).then(game => {
        setGame(game);
      });
    });
  };

  const handleDeleteGame = () => {
    onDeleteGame({ gameId }).then(() => {
      setLocation('/');
    });
  };

  return (
    <Flex direction="column" gap="7" mt="7" mb="7">
      <Box>
        <Skeleton loading={!game}>
          <Navigation
            previousPage="/"
            breadcrumbs={[
              {
                path: '/',
                name: 'Games',
              },
              {
                name: game?.name,
                active: true,
              },
            ]}
          />
        </Skeleton>
        <Separator mt="3" size="4" />
      </Box>
      <Flex direction="column" gap="3" mb="9">
        <Flex direction="row" justify="between" align="center" gap="2">
          {!!game ? (
            <RenameField name={game.name} onChange={handleRenameGame} />
          ) : (
            <Skeleton>
              <Heading as="h1" size="8">
                loading...
              </Heading>
            </Skeleton>
          )}
          {!!game ? (
            <DeleteDialog
              type="game"
              name={game.name}
              onConfirm={handleDeleteGame}
            >
              <TrashIcon /> Delete game
            </DeleteDialog>
          ) : (
            <Skeleton>
              <Button>loading...</Button>
            </Skeleton>
          )}
        </Flex>
        <Text as="h2" size="4" color="gray">
          Select the scene you want to manage, or create a new one to get
          started.
        </Text>
        <Separator mt="3" size="4" />
        <Flex direction="row" gap="3" justify="between" align="center">
          <Heading as="h3" size="7">
            Your scenes
          </Heading>
          {!!game ? (
            <NewSceneDialog
              gameId={gameId}
              onCreated={created => {
                setLocation(`/games/${gameId}/scenes/${created.id}`);
              }}
            />
          ) : (
            <Skeleton>
              <Button>loading...</Button>
            </Skeleton>
          )}
        </Flex>
        <Text as="h3" size="2" color="gray" mb="3">
          Manage the scenes for your games by clicking on their title or any of
          their playlists.
        </Text>
        {!game &&
          [1, 2, 3].map(index => (
            <Flex key={index} gap="2" direction="column">
              <Flex direction="row" gap="3" align="center">
                <Skeleton>
                  <Heading as="h4" size="6" color="white">
                    loading
                  </Heading>
                </Skeleton>
              </Flex>
              <LoadingPlaylistList />
            </Flex>
          ))}
        {!!game && !game?.scenes.length && (
          <Callout.Root>
            <Callout.Icon>
              <ViewNoneIcon />
            </Callout.Icon>
            <Callout.Text>
              No scenes created, click the "New scene" button to get started.
            </Callout.Text>
          </Callout.Root>
        )}
        {game?.scenes.map(scene => (
          <Flex key={scene.id} gap="2" direction="column">
            <Flex direction="row" gap="3" align="center">
              <Heading as="h4" size="6" color="white">
                <Link
                  to={`/games/${gameId}/scenes/${scene.id}`}
                  style={{ color: 'inherit' }}
                >
                  {scene.name}
                </Link>
              </Heading>
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
