import { useEffect, useState } from 'react';
import {
  Card,
  Heading,
  Flex,
  Text,
  Spinner,
  Button,
  Callout,
  Dialog,
  TextField,
} from '@radix-ui/themes';
import { PlusIcon, ViewNoneIcon } from '@radix-ui/react-icons';
import { useLocation, Link } from 'wouter';

import { onAddGame, onGetGames } from '../backend/games.telefunc';

export const Home = () => {
  const [, setLocation] = useLocation();

  const [games, setGames] = useState(null);
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    onGetGames().then(games => setGames(games));
  }, [setGames]);

  const handleCreateGame = event => {
    event.preventDefault();
    if (!gameName) {
      setError({ name: 'The name should not be empty.' });
      return;
    }

    onAddGame({ gameName }).then(created => {
      setLocation(`/games/${created.id}`);
    });
  };

  const header = (
    <Flex align="center" direction="column" gap="3" mt="8" mb="9">
      <Heading as="h1" size="9">
        Tabletop RPG media console
      </Heading>
      <Text as="h1" size="7" color="gray">
        Start managing your tabletop audio with ease: create playlists, add
        songs, rename tracks, and play tailored audio for your scenes.
      </Text>
    </Flex>
  );

  if (!games) {
    return (
      <>
        {header}
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
    <>
      {header}
      <Dialog.Root
        onOpenChange={() => {
          setGameName('');
          setError('');
        }}
      >
        <Card variant="classic">
          <Flex direction="column" flexGrow="1" gap="5">
            <Flex direction="row" justify="between">
              <Flex gap="2" direction="column">
                <Text as="h1" size="4" weight="bold">
                  Your games
                </Text>
                <Text as="h2" size="2" color="gray">
                  Select one of the games below to manage its playlists, or
                  create a new one to get started
                </Text>
              </Flex>
              <Dialog.Trigger>
                <Button style={{ cursor: 'pointer' }}>
                  <PlusIcon /> New game
                </Button>
              </Dialog.Trigger>
            </Flex>
            <Flex gap="3" direction="column">
              {!games.length && (
                <Callout.Root>
                  <Callout.Icon>
                    <ViewNoneIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    No games created, click the "New game" button to get
                    started.
                  </Callout.Text>
                </Callout.Root>
              )}
              {games.map(
                ({ id, name, scenesCount, playlistsCount, songsCount }) => (
                  <Card
                    asChild
                    key={id}
                    style={{
                      flex: 1,
                      minWidth: '32em',
                    }}
                  >
                    <Link to={`/games/${id}`}>
                      <Flex
                        direction="row"
                        justify="between"
                        align="center"
                        gap="3"
                      >
                        <Flex gap="" direction="column">
                          <Heading as="h3" size="3">
                            {name}
                          </Heading>
                          <Text as="div" size="2" color="gray">
                            {scenesCount} scenes
                          </Text>
                          <Text as="div" size="2" color="gray">
                            {playlistsCount} playlists
                          </Text>
                          <Text as="div" size="2" color="gray">
                            {songsCount} songs
                          </Text>
                        </Flex>
                      </Flex>
                    </Link>
                  </Card>
                )
              )}
            </Flex>
          </Flex>
          <Dialog.Content maxWidth="450px">
            <Dialog.Title>Create a new game</Dialog.Title>
            <Dialog.Description size="2" mb="3" color="gray">
              Enter the game's name to create it, you will be redirected once
              the game is created.
            </Dialog.Description>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Name
                </Text>
                <TextField.Root
                  required
                  name="name"
                  color={error?.name ? 'red' : undefined}
                  variant={error?.name ? 'soft' : undefined}
                  placeholder="My very awesome game"
                  value={gameName}
                  onChange={event => setGameName(event.target.value)}
                />
                {error?.name && (
                  <Text as="div" size="2" mt="1" color="red">
                    {error.name}
                  </Text>
                )}
              </label>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button onClick={handleCreateGame}>Create</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Card>
      </Dialog.Root>
    </>
  );
};
