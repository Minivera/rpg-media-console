import { useEffect, useState } from 'react';
import {
  Card,
  Heading,
  Flex,
  Text,
  Button,
  Callout,
  Dialog,
  TextField,
  Separator,
  Skeleton,
  Box,
  IconButton,
} from '@radix-ui/themes';
import {
  Cross1Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  ViewNoneIcon,
} from '@radix-ui/react-icons';
import { useLocation, Link } from 'wouter';
import { useDebounceCallback } from 'usehooks-ts';

import { onAddGame, onGetGames } from '../backend/games.telefunc';

export const Home = () => {
  const [, setLocation] = useLocation();

  const [games, setGames] = useState(null);
  const [gameName, setGameName] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    onGetGames().then(games => setGames(games));
  }, [setGames]);

  const handleSearch = searchValue => {
    setSearch(searchValue);
    onGetGames({ search: searchValue }).then(games => setGames(games));
  };

  const debouncedSearch = useDebounceCallback(value => {
    handleSearch(value);
  }, 500);

  const handleCreateGame = event => {
    event.preventDefault();
    if (!gameName) {
      setError({ name: 'The name should not be empty.' });
      return;
    }

    onAddGame({ gameName }).then(created => {
      setLocation(`~/games/${created.id}`);
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
        <Flex direction="column" flexGrow="1" gap="5">
          <Flex gap="2" direction="column">
            <Flex direction="row" justify="between">
              <Heading as="h2" size="7">
                All games
              </Heading>
              <Skeleton loading>
                <Button>
                  <PlusIcon /> New game
                </Button>
              </Skeleton>
            </Flex>
            <Text as="h3" size="2" color="gray">
              Select one of the games below to manage its playlists, or create a
              new one to get started
            </Text>
            <Box maxWidth={{ initial: '100%', sm: '400px' }}>
              <TextField.Root placeholder="Search games..." disabled>
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
            </Box>
          </Flex>
          <Separator size="4" />
          <Flex gap="3" direction="column">
            {[1, 2, 3].map(index => (
              <Skeleton key={index}>
                <Card
                  asChild
                  style={{
                    flex: 1,
                  }}
                >
                  <Flex
                    direction="row"
                    justify="between"
                    align="center"
                    gap="3"
                  >
                    <Flex gap="" direction="column">
                      <Heading as="h3" size="3">
                        loading
                      </Heading>
                      <Text as="div" size="2" color="gray">
                        loading
                      </Text>
                      <Text as="div" size="2" color="gray">
                        loading
                      </Text>
                      <Text as="div" size="2" color="gray">
                        loading
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              </Skeleton>
            ))}
          </Flex>
        </Flex>
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
        <Flex direction="column" flexGrow="1" gap="5">
          <Flex gap="2" direction="column">
            <Flex direction="row" justify="between">
              <Heading as="h2" size="7">
                All games
              </Heading>
              <Dialog.Trigger>
                <Button style={{ cursor: 'pointer' }}>
                  <PlusIcon /> New game
                </Button>
              </Dialog.Trigger>
            </Flex>
            <Text as="h3" size="2" color="gray">
              Select one of the games below to manage its playlists, or create a
              new one to get started
            </Text>
            <Box maxWidth={{ initial: '100%', sm: '400px' }}>
              <TextField.Root
                placeholder="Search games..."
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
          </Flex>
          <Separator size="4" />
          <Flex gap="3" direction="column">
            {!games.length && (
              <Callout.Root>
                <Callout.Icon>
                  <ViewNoneIcon />
                </Callout.Icon>
                <Callout.Text>
                  No games {!!search ? 'found' : 'created'}, click the "New
                  game" button{' '}
                  {!!search
                    ? ' to create one or change your search term to view games'
                    : ' to get started'}
                  .
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
                  }}
                >
                  <Link to={`~/games/${id}`}>
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
            Enter the game's name to create it, you will be redirected once the
            game is created.
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
      </Dialog.Root>
    </>
  );
};
