import { useState } from 'react';
import {
  Button,
  Dialog,
  Flex,
  Text,
  TextField,
  Spinner,
  Avatar,
  Box,
} from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import ReactPlayer from 'react-player';

import { getVideoInformation } from '../player/getVideoInformation.js';

import { Duration } from './Duration.jsx';
import { onAddSongToPlaylist } from '../backend/songs.telefunc.js';

export const AddSongDialog = ({ gameId, sceneId, playlistId, onAdded }) => {
  const [songURL, setSongURL] = useState('');
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoadSong = () => {
    setLoading(true);
    setSongData(false);

    if (!songURL) {
      setError({ name: 'The URL should not be empty.' });
      return;
    }

    getVideoInformation(songURL)
      .then(songData => setSongData(songData))
      .catch(err => setError({ url: err.toString() }))
      .finally(() => setLoading(false));
  };

  const handleAddSong = () => {
    if (!songData || !songData.duration) {
      return;
    }

    onAddSongToPlaylist({ gameId, sceneId, playlistId, songData }).then(
      added => {
        onAdded(added);
      }
    );
  };

  return (
    <Dialog.Root
      onOpenChange={() => {
        setSongURL('');
        setSongData(null);
        setError('');
      }}
    >
      <Dialog.Trigger>
        <Button style={{ cursor: 'pointer' }}>
          <PlusIcon /> Add song
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Add a new song</Dialog.Title>
        <Dialog.Description size="2" mb="3" color="gray">
          Enter the song's URL here to fetch its information, then validate this
          is the right song to import.
        </Dialog.Description>
        <Flex direction="column" gap="3" mb="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Video URL
            </Text>
            <TextField.Root
              required
              type="url"
              name="url"
              color={error?.url ? 'red' : undefined}
              variant={error?.url ? 'soft' : undefined}
              placeholder="https://www.youtube.com/watch?<video ID>"
              value={songURL}
              onChange={event => setSongURL(event.target.value)}
              onBlur={handleLoadSong}
            >
              {loading && (
                <TextField.Slot>
                  <Spinner height="16" width="16" />
                </TextField.Slot>
              )}
            </TextField.Root>
            {error?.url && (
              <Text as="div" size="2" mt="1" color="red">
                {error.url}
              </Text>
            )}
          </label>
        </Flex>
        {!!songData && (
          <Flex gap="3" align="center">
            <Avatar src={songData.image} fallback={songData.originalName} />
            <Flex direction="column" gap="1">
              <Text size="2">{songData.originalName}</Text>
              <Text size="1" color="gray">
                {songData.author}
              </Text>
            </Flex>
            <Box style={{ display: 'none' }}>
              <ReactPlayer
                url={songData.url}
                onDuration={duration => {
                  setSongData(songData => ({
                    ...songData,
                    duration,
                  }));
                }}
              />
            </Box>
            <Flex justify="center" align="center">
              {songData.duration ? (
                <Duration seconds={songData.duration}>
                  {songData.duration}
                </Duration>
              ) : (
                <Spinner />
              )}
            </Flex>
          </Flex>
        )}
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              disabled={!songData || !songData.duration}
              onClick={handleAddSong}
            >
              Add
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
