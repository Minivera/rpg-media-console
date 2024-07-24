import { useState } from 'react';
import {
  Box,
  Link,
  Button,
  Dialog,
  Flex,
  Text,
  TextField,
  Card,
} from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';

import { onAddPlaylistToScene } from '../backend/playlists.telefunc.js';

export const NewPlaylistDialog = ({
  gameId,
  sceneId,
  onCreated,
  asCard = false,
}) => {
  const [playlistName, setPlaylistName] = useState('');
  const [error, setError] = useState(null);

  const handleCreatePlaylist = event => {
    event.preventDefault();
    if (!playlistName) {
      setError({ name: 'The name should not be empty.' });
      return;
    }

    onAddPlaylistToScene({ gameId, sceneId, playlistName }).then(created => {
      onCreated(created);
    });
  };

  return (
    <Dialog.Root
      onOpenChange={() => {
        setPlaylistName('');
        setError('');
      }}
    >
      {asCard ? (
        <Dialog.Trigger>
          <Card asChild>
            <Button
              style={{ cursor: 'pointer', height: '100%', width: '100%' }}
            >
              <Flex justify="center" align="center" height="100%" width="100%">
                <PlusIcon /> New Playlist
              </Flex>
            </Button>
          </Card>
        </Dialog.Trigger>
      ) : (
        <Dialog.Trigger>
          <Button style={{ cursor: 'pointer' }}>
            <PlusIcon /> New Playlist
          </Button>
        </Dialog.Trigger>
      )}
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Create a new playlist</Dialog.Title>
        <Dialog.Description size="2" mb="3" color="gray">
          Enter the playlist's name to create it, you will then be able to
          navigate to it to add new songs.
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
              placeholder="My very awesome playlist"
              value={playlistName}
              onChange={event => setPlaylistName(event.target.value)}
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
            <Button onClick={handleCreatePlaylist}>Create</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
