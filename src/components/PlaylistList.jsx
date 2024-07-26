import { useState } from 'react';
import {
  ScrollArea,
  Box,
  Flex,
  Text,
  Card,
  Inset,
  AspectRatio,
  IconButton,
} from '@radix-ui/themes';
import { Link, useLocation } from 'wouter';

import { NewPlaylistDialog } from './NewPlaylistDialog.jsx';
import { PlayIcon } from '@radix-ui/react-icons';
import { usePlaySongs } from '../player/PlayerContext.jsx';

const PlaylistCard = ({ gameId, sceneId, playlist }) => {
  const [, setLocation] = useLocation();
  const playSongs = usePlaySongs();

  const [hovered, setHovered] = useState(false);

  return (
    <Box p="3" m="-3" key={playlist.id}>
      <Box
        height="185px"
        width="185px"
        mb="1"
        position="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Card>
          <Inset>
            <AspectRatio ratio={1}>
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'grid',
                  gridTemplateRows: '50% 50%',
                  gridTemplateColumns: '50% 50%',
                }}
              >
                {playlist.featuredSongs
                  .concat(
                    new Array(4 - playlist.featuredSongs.length).fill(undefined)
                  )
                  .map((song, index) =>
                    song ? (
                      <img
                        src={song.image}
                        alt={song.originalName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        key={index}
                      />
                    ) : (
                      <Box
                        width="100%"
                        height="100%"
                        key={index}
                        style={{
                          backgroundColor: [
                            '#FFFFFF1B',
                            '#FFFFFF2C',
                            '#FFFFFF3B',
                            '#FFFFFF55',
                          ][index],
                        }}
                      />
                    )
                  )}
              </Box>
            </AspectRatio>
          </Inset>
        </Card>
        {hovered && (
          <Flex gap="2" position="absolute" bottom="0" right="0" m="2">
            <IconButton
              tabIndex={-1}
              radius="full"
              size="3"
              onClick={() => {
                playSongs(playlist.songs);
                setLocation(
                  `/games/${gameId}/scenes/${sceneId}/playlists/${playlist.id}`
                );
              }}
            >
              <PlayIcon />
            </IconButton>
          </Flex>
        )}
      </Box>
      <Flex direction="column" position="relative" align="start">
        <Link
          to={`/games/${gameId}/scenes/${sceneId}/playlists/${playlist.id}`}
        >
          <Text size="2" weight="medium" color="gray" highContrast>
            {playlist.name}
          </Text>
        </Link>
        <Text size="2" color="gray">
          {playlist.songsCount} songs
        </Text>
      </Flex>
    </Box>
  );
};

export const PlaylistList = ({
  gameId,
  sceneId,
  playlists,
  onCreatePlaylist,
  orientation = 'horizontal',
}) => {
  return (
    <ScrollArea size="1" scrollbars={orientation}>
      <Flex
        direction={orientation === 'horizontal' ? 'row' : 'column'}
        gap="5"
        pr="3"
      >
        {playlists.map(playlist => (
          <PlaylistCard
            gameId={gameId}
            sceneId={sceneId}
            playlist={playlist}
            key={playlist.id}
          />
        ))}
        <Box p="3" m="-3">
          <Box height="185px" width="185px" mb="2" position="relative">
            <Card asChild>
              <NewPlaylistDialog
                gameId={gameId}
                sceneId={sceneId}
                onCreated={onCreatePlaylist}
                asCard
              />
            </Card>
          </Box>
        </Box>
      </Flex>
    </ScrollArea>
  );
};
