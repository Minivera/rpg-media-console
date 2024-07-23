import { useState } from 'react';
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';

import { onAddSceneToGame } from '../backend/scenes.telefunc.js';

export const NewSceneDialog = ({ gameId, onCreated }) => {
  const [sceneName, setSceneName] = useState('');
  const [error, setError] = useState(null);

  const handleCreateScene = event => {
    event.preventDefault();
    if (!sceneName) {
      setError({ name: 'The name should not be empty.' });
      return;
    }

    onAddSceneToGame({ gameId, sceneName }).then(created => {
      onCreated(created);
    });
  };

  return (
    <Dialog.Root
      onOpenChange={() => {
        setSceneName('');
        setError('');
      }}
    >
      <Dialog.Trigger>
        <Button style={{ cursor: 'pointer' }}>
          <PlusIcon /> New Scene
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Create a new scene</Dialog.Title>
        <Dialog.Description size="2" mb="3" color="gray">
          Enter the scene's name to create it, you will be redirected once the
          scene is created.
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
              placeholder="My very awesome scene"
              value={sceneName}
              onChange={event => setSceneName(event.target.value)}
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
            <Button onClick={handleCreateScene}>Create</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
