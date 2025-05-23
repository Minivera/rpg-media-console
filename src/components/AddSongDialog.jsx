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
  Separator,
  Tabs,
  IconButton,
  ScrollArea,
  RadioCards,
  Callout,
} from '@radix-ui/themes';
import {
  Cross1Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  ViewNoneIcon,
} from '@radix-ui/react-icons';
import ReactPlayer from 'react-player';

import { getVideoInformation } from '../player/getVideoInformation.js';

import { Duration } from './Duration.jsx';
import {
  onAddSongToPlaylist,
  onGetAllGameSongs,
} from '../backend/songs.telefunc.js';
import { useDebouncedCallback } from 'use-debounce';

export const AddSongDialog = ({ gameId, sceneId, playlistId, onAdded }) => {
  const [songURL, setSongURL] = useState('');
  const [search, setSearch] = useState('');

  const [foundSongs, setFoundSongs] = useState(null);
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = searchValue => {
    setFoundSongs(null);
    setSearch(searchValue);
    setSongData(false);

    if (!searchValue) {
      return;
    }

    onGetAllGameSongs({ gameId, search: searchValue }).then(songs =>
      setFoundSongs(songs)
    );
  };

  const debouncedSearch = useDebouncedCallback(value => {
    handleSearch(value);
  }, 500);

  const handleLoadSong = () => {
    if (!songURL) {
      setError({ name: 'The URL should not be empty.' });
      return;
    }

    setLoading(true);
    setSongData(false);

    getVideoInformation(songURL)
      .then(songData => setSongData(songData))
      .catch(err => setError({ url: err.toString() }))
      .finally(() => setLoading(false));
  };

  const handleAddSong = () => {
    if (!songData || !songData.duration) {
      return;
    }

    setSearch('');
    setFoundSongs(null);
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
          Add a new song by pasting the video URL from youtube, or selecting one
          of your already imported songs.
        </Dialog.Description>
        <Separator mt="3" size="4" />
        <Tabs.Root defaultValue="new">
          <Tabs.List>
            <Tabs.Trigger value="new">From Youtube</Tabs.Trigger>
            <Tabs.Trigger value="existing">Existing song</Tabs.Trigger>
          </Tabs.List>
          <Box pt="3">
            <Tabs.Content value="new">
              <Text size="2" color="gray">
                Enter the song's URL here to fetch its information, then
                validate this is the right song to import.
              </Text>
              <Flex direction="column" gap="3" mt="3" mb="3">
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
                  <Avatar
                    src={songData.image}
                    fallback={songData.originalName}
                  />
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
            </Tabs.Content>
            <Tabs.Content value="existing">
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Enter the song's URL here to fetch its information, then
                  validate this is the right song to import.
                </Text>
                <Box>
                  <TextField.Root
                    placeholder="Search a song..."
                    value={search}
                    onChange={event => {
                      setSearch(event.target.value);
                      debouncedSearch(event.target.value);
                    }}
                  >
                    <TextField.Slot>
                      <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                    {!!search && !!foundSongs && (
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
                    {!!search && !foundSongs && (
                      <TextField.Slot>
                        <Spinner size="3" />
                      </TextField.Slot>
                    )}
                  </TextField.Root>
                </Box>
                <ScrollArea scrollbars="vertical" style={{ maxHeight: '60vh' }}>
                  {!!foundSongs && !foundSongs.length && (
                    <Callout.Root>
                      <Callout.Icon>
                        <ViewNoneIcon />
                      </Callout.Icon>
                      <Callout.Text>
                        No songs found for the text "{search}". Change your
                        search and try again.
                      </Callout.Text>
                    </Callout.Root>
                  )}
                  {!!foundSongs && foundSongs.length > 0 && (
                    <RadioCards.Root
                      value={songData?.id}
                      onValueChange={id => {
                        let foundSong = foundSongs.find(song => song.id === id);
                        if (!foundSong) {
                          setSongData(null);
                        }

                        foundSong = { ...foundSong };
                        delete foundSong.id;
                        setSongData(foundSong);
                      }}
                    >
                      <Flex direction="column" gap="2">
                        {foundSongs.map(song => (
                          <RadioCards.Item value={song.id} key={song.id}>
                            <Flex gap="3" width="100%">
                              <Avatar
                                src={song.image}
                                fallback={song.originalName}
                              />
                              <Flex
                                direction="column"
                                gap="1"
                                flexGrow="1"
                                maxWidth="calc(100% - 100px)"
                              >
                                <Text size="2">{song.name}</Text>
                                <Text size="1" truncate>
                                  {song.originalName}
                                </Text>
                                <Text size="1" color="gray">
                                  {song.author}
                                </Text>
                              </Flex>
                              <Flex justify="center" align="center">
                                <Duration seconds={song.duration}>
                                  {song.duration}
                                </Duration>
                              </Flex>
                            </Flex>
                          </RadioCards.Item>
                        ))}
                      </Flex>
                    </RadioCards.Root>
                  )}
                </ScrollArea>
              </Flex>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
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
