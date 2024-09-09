import { Fragment, useState } from 'react';
import {
  ScrollArea,
  Box,
  Flex,
  Text,
  Card,
  Inset,
  AspectRatio,
  IconButton,
  Skeleton,
} from '@radix-ui/themes';
import { Link, useLocation } from 'wouter';
import { PlayIcon } from '@radix-ui/react-icons';

import { NewPlaylistDialog } from './NewPlaylistDialog.jsx';
import { usePlaySongs } from '../player/PlayerContext.jsx';
import { useIsBreakpoint } from '../hooks/useBreakpoints.jsx';

const PlaylistCard = ({ gameId, sceneId, playlist }) => {
  const isMd = useIsBreakpoint('md');
  const [, setLocation] = useLocation();
  const playSongs = usePlaySongs();

  const [hovered, setHovered] = useState(false);

  return (
    <Box p="3">
      <Box
        height={{ md: '185px', initial: '0' }}
        width="185px"
        maxWidth="100%"
        pb={{ md: '0', initial: '100%' }}
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
        {(hovered || !isMd) && (
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
  const isMd = useIsBreakpoint('md');

  let Parent = Flex;
  if (isMd) {
    Parent = ScrollArea;
  }

  return (
    <Parent size="1" scrollbars={orientation} width={isMd ? undefined : '100%'}>
      <Flex
        direction={orientation === 'horizontal' || !isMd ? 'row' : 'column'}
        gap={{ md: '5', initial: '2' }}
        pr={{ md: '3', initial: '0' }}
        wrap={{ md: 'nowrap', initial: 'wrap' }}
      >
        {playlists.map(playlist => (
          <PlaylistCard
            gameId={gameId}
            sceneId={sceneId}
            playlist={playlist}
            key={playlist.id}
          />
        ))}
        <Box p="3">
          <Box
            height={{ md: '185px', initial: '0' }}
            pb={{ md: '0', initial: '100%' }}
            width="185px"
            maxWidth="100%"
            mb="2"
            position="relative"
          >
            <NewPlaylistDialog
              gameId={gameId}
              sceneId={sceneId}
              onCreated={onCreatePlaylist}
              asCard
            />
          </Box>
        </Box>
      </Flex>
    </Parent>
  );
};

export const LoadingPlaylistList = ({ orientation = 'horizontal' }) => {
  const isMd = useIsBreakpoint('md');

  let Parent = Flex;
  if (isMd) {
    Parent = ScrollArea;
  }

  return (
    <Parent size="1" scrollbars={orientation} width={isMd ? undefined : '100%'}>
      <Flex
        direction={orientation === 'horizontal' || !isMd ? 'row' : 'column'}
        gap={{ md: '5', initial: '2' }}
        pr={{ md: '3', initial: '0' }}
        wrap={{ md: 'nowrap', initial: 'wrap' }}
      >
        {[1, 2, 3].map(index => (
          <Box p="3" maxWidth={{ md: 'unset', initial: '48%' }} key={index}>
            <Box
              height={{ md: '185px', initial: '0' }}
              pb={{ md: '0', initial: '100%' }}
              width="185px"
              maxWidth="100%"
              mb="2"
              position="relative"
            >
              <Skeleton>
                <Card
                  style={{
                    height: '100%',
                    position: isMd ? 'unset' : 'absolute',
                    inset: isMd ? 'unset' : 0,
                  }}
                />
              </Skeleton>
            </Box>
            <Flex direction="column" position="relative" align="start">
              <Skeleton>
                <Text size="2" weight="medium" color="gray" highContrast>
                  loading...
                </Text>
              </Skeleton>
              <Skeleton>
                <Text size="2" color="gray">
                  loading...
                </Text>
              </Skeleton>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Parent>
  );
};
