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
  ScrollArea,
  Callout,
} from '@radix-ui/themes';
import { ViewNoneIcon, DownloadIcon } from '@radix-ui/react-icons';

import { onAddSongsToPlaylist } from '../backend/songs.telefunc.js';
import { onGetYoutubePlaylistSongs } from '../backend/youtube.telefunc.js';
import { onAddPlaylistToScene } from '../backend/playlists.telefunc.js';

import { Duration } from './Duration.jsx';

export const ImportPlaylistDialog = ({
  gameId,
  sceneId,
  playlistId,
  onImport,
  button,
}) => {
  const [playlistURL, setPlaylistURL] = useState('');

  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoadPlaylist = () => {
    setPlaylistData(null);
    setLoading(true);

    if (!playlistURL) {
      return;
    }

    onGetYoutubePlaylistSongs({ playlistURL })
      .then(playlistData => {
        setPlaylistData(playlistData);
      })
      .catch(err => setError({ url: err.toString() }))
      .finally(() => {
        setLoading(false);
      });
  };

  const handleImportPlaylist = () => {
    if (!playlistData) {
      return;
    }

    if (playlistId) {
      onAddSongsToPlaylist({
        gameId,
        sceneId,
        playlistId,
        songs: playlistData.songs,
      }).then(() => {
        onImport();
      });
    } else {
      onAddPlaylistToScene({
        gameId,
        sceneId,
        playlistName: playlistData.title,
        songs: playlistData.songs,
      }).then(added => {
        onImport(added);
      });
    }
  };

  return (
    <Dialog.Root
      onOpenChange={() => {
        setPlaylistURL('');
        setPlaylistData(null);
        setError('');
      }}
    >
      <Dialog.Trigger>
        {button ? (
          button
        ) : (
          <Button style={{ cursor: 'pointer' }}>
            <DownloadIcon /> Import Playlist
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Content maxWidth="650px">
        <Dialog.Title>
          Import {playlistId ? 'into an existing' : 'a new'} playlist
        </Dialog.Title>
        <Dialog.Description size="2" mb="3" color="gray">
          Import{' '}
          {playlistId
            ? 'all the songs from a Youtube playlist URL into the existing playlist.'
            : 'a new playlist by loading all the songs from a Youtube playlist URL.'}
          <br />
          <br />
          Loading all the songs may take multiple minutes, especially for very
          large playlists. Once imported, the new songs will be{' '}
          {playlistId
            ? 'added at the end of the playlist.'
            : 'added to a new playlist under the name of the Youtube playlist.'}
        </Dialog.Description>
        <Box pt="3">
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="3" mt="3" mb="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Playlist URL
                </Text>
                <TextField.Root
                  required
                  type="url"
                  name="url"
                  color={error?.url ? 'red' : undefined}
                  variant={error?.url ? 'soft' : undefined}
                  placeholder="https://www.youtube.com/playlist?list=<playlist ID>"
                  value={playlistURL}
                  onChange={event => setPlaylistURL(event.target.value)}
                  onBlur={handleLoadPlaylist}
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
            <ScrollArea scrollbars="vertical" style={{ maxHeight: '60vh' }}>
              {!!playlistData && !playlistData.songs.length && (
                <Callout.Root>
                  <Callout.Icon>
                    <ViewNoneIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    No songs found in the playlist, make sure the playlist URL
                    is valid
                  </Callout.Text>
                </Callout.Root>
              )}
              {!!playlistData && playlistData.songs.length > 0 && (
                <Flex direction="column" gap="2">
                  {playlistData.songs.map(song => (
                    <Flex gap="3" width="100%" key={song.id}>
                      <Avatar src={song.image} fallback={song.originalName} />
                      <Flex
                        direction="column"
                        gap="1"
                        flexGrow="1"
                        maxWidth="calc(100% - 175px)"
                        style={{
                          textOverflow: 'ellipsis',
                        }}
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
                  ))}
                </Flex>
              )}
            </ScrollArea>
          </Flex>
        </Box>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              disabled={!playlistData?.songs?.length}
              onClick={handleImportPlaylist}
            >
              Import
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
