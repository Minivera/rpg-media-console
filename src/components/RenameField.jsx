import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  TextField,
} from '@radix-ui/themes';
import { CheckIcon, Cross1Icon, Pencil2Icon } from '@radix-ui/react-icons';

export const RenameField = ({
  name,
  onChange,
  asText = false,
  asHeading = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [error, setError] = useState(null);

  useEffect(() => {
    setNewName(name);
  }, [name, onChange]);

  const handleEditingMode = opened => {
    setIsEditing(opened);
    setError(null);
  };

  const handleSave = () => {
    if (newName === '') {
      setError({ name: 'Field is required.' });
      return;
    }

    handleEditingMode(false);
    onChange(newName);
  };

  return (
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
            value={newName}
            onChange={event => setNewName(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                handleSave();
              }
            }}
          >
            <TextField.Slot>
              <IconButton
                size="1"
                variant="ghost"
                onClick={handleSave}
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
          {asText && <Text size="2">{newName}</Text>}
          {asHeading && !asText && (
            <Heading as="h1" size="8">
              {newName}
            </Heading>
          )}
        </>
      )}
    </Flex>
  );
};
