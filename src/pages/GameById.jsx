import { useEffect, useState } from 'react';
import {
  Card,
  Heading,
  Flex,
  Box,
  Spinner,
  IconButton,
  TextField,
  Text,
  Separator,
  Callout,
} from '@radix-ui/themes';
import {
  CheckIcon,
  Cross1Icon,
  Pencil2Icon,
  ViewNoneIcon,
} from '@radix-ui/react-icons';
import { useParams, useLocation } from 'wouter';

import { onGetGameById, onUpdateGame } from '../backend/games.telefunc';
import { Navigation } from '../components/Navigation.jsx';
import { NewSceneDialog } from '../components/NewSceneDialog.jsx';

export const GameById = () => {
  const { gameId } = useParams();
  const [, setLocation] = useLocation();

  const [game, setGame] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    onGetGameById({ gameId }).then(game => setGame(game));
  }, [setGame]);

  const handleEditingMode = opened => {
    setIsEditing(opened);
    setGameName(game.name);
    setError(null);
  };

  const handleRenameGame = () => {
    if (!gameName) {
      setError({ name: 'The name should not be empty.' });
      return;
    }

    setIsRenaming(true);
    onUpdateGame({ gameId, gameName }).then(() => {
      onGetGameById({ gameId }).then(game => {
        handleEditingMode(false);
        setGame(game);
        setIsRenaming(false);
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
        <Flex direction="row" gap="2" align="center">
          {isEditing ? (
            <Box>
              <TextField.Root
                required
                autoFocus
                name="name"
                color={error?.name ? 'red' : undefined}
                variant={error?.name ? 'soft' : undefined}
                placeholder="Write a new name"
                size="2"
                value={gameName}
                onChange={event => setGameName(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    handleRenameGame();
                  }
                }}
              >
                <TextField.Slot>
                  <IconButton
                    size="1"
                    variant="ghost"
                    onClick={handleRenameGame}
                    loading={isRenaming}
                    style={{ cursor: 'pointer' }}
                  >
                    <CheckIcon height="16" width="16" />
                  </IconButton>
                  <IconButton
                    size="1"
                    variant="ghost"
                    onClick={() => handleEditingMode(false)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Cross1Icon height="16" width="16" />
                  </IconButton>
                </TextField.Slot>
              </TextField.Root>
              {error?.name && (
                <Text as="div" size="1" mt="1" color="red">
                  {error.name}
                </Text>
              )}
            </Box>
          ) : (
            <>
              <IconButton
                variant="ghost"
                onClick={() => handleEditingMode(true)}
                style={{ cursor: 'pointer' }}
              >
                <Pencil2Icon width="18" height="18" />
              </IconButton>
              <Heading as="h1" size="8">
                {game.name}
              </Heading>
            </>
          )}
        </Flex>
        <Text as="h2" size="4" color="gray">
          Select the scene you want to manage, or create a new one to get
          started.
        </Text>
        <Separator mt="3" size="4" />
        <Flex direction="row" gap="3" justify="between">
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
      </Flex>
    </Flex>
  );
};
