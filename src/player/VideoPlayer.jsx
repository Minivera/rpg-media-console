import { useContext, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  Flex,
  Grid,
  IconButton,
  Text,
} from '@radix-ui/themes';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  PauseIcon,
  PlayIcon,
} from '@radix-ui/react-icons';
import Slider from 'rc-slider';
import ReactPlayer from 'react-player';

import { Duration } from '../components/Duration.jsx';
import { useIsBreakpoint } from '../hooks/useBreakpoints.jsx';

import { PlayerContext } from './PlayerContext.jsx';

export const VideoPlayer = () => {
  const playerRef = useRef(null);
  const playerContext = useContext(PlayerContext);
  const [played, setPlayed] = useState(0);

  const isMd = useIsBreakpoint('md');

  if (!playerContext) {
    throw new Error('Wrap the app inside a PlayerProvider component');
  }

  const playingSong = playerContext.songs[playerContext.currentIndex];

  if (!playingSong) {
    return (
      <Box
        position="fixed"
        right="0"
        bottom={{ sm: '2', initial: '0' }}
        left={{ sm: 'unset', initial: '0' }}
        mr={{ sm: '-2', initial: '0' }}
        width={{ sm: '450px', initial: 'auto' }}
        maxWidth="450px"
      >
        <Card>
          <Flex justify="between" gap="2" pr="6" align="center">
            <IconButton variant="ghost" size="2" disabled>
              <DoubleArrowLeftIcon />
            </IconButton>
            <IconButton
              radius="full"
              size="3"
              disabled
              loading={playerContext.loading}
            >
              <PlayIcon />
            </IconButton>
            <IconButton variant="ghost" size="2" disabled>
              <DoubleArrowRightIcon />
            </IconButton>
            <Flex gap="3" align="center" flexGrow="1" ml="2">
              <Avatar size="4" />
              <Flex
                direction="column"
                flexGrow="1"
                width="200px"
                overflowX="hidden"
              >
                <Text size="2" color="gray" wrap="nowrap">
                  Select a song to play
                </Text>
              </Flex>
              <Flex justify="center" align="center" />
            </Flex>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      position="fixed"
      right="0"
      bottom={{ sm: '2', initial: '0' }}
      left={{ sm: 'unset', initial: '0' }}
      mr={{ sm: '-2', initial: '0' }}
      width={{ sm: '450px', initial: 'auto' }}
      maxWidth="450px"
    >
      <Card>
        <Flex justify="between" gap="2" pr="6" align="center">
          <IconButton
            variant="ghost"
            size="2"
            disabled={playerContext.currentIndex <= 0}
            onClick={() => {
              playerContext.setPlaying(state => ({
                ...state,
                currentIndex: state.currentIndex - 1,
              }));
            }}
          >
            <DoubleArrowLeftIcon />
          </IconButton>
          <IconButton
            radius="full"
            size="3"
            onClick={() => {
              playerContext.setPlaying(state => ({
                ...state,
                playing: !state.playing,
              }));
            }}
          >
            {playerContext.playing ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          <IconButton
            variant="ghost"
            size="2"
            disabled={
              playerContext.currentIndex >= playerContext.songs.length - 1
            }
            onClick={() => {
              playerContext.setPlaying(state => ({
                ...state,
                currentIndex: state.currentIndex + 1,
              }));
            }}
          >
            <DoubleArrowRightIcon />
          </IconButton>
          <Flex align="center" flexGrow="1" ml="2">
            <Flex direction="column" gap="2">
              <Flex align="center" gap="3">
                <Avatar
                  src={playingSong.image}
                  fallback={playingSong.originalName}
                  size="4"
                />
                <Flex
                  direction="column"
                  flexGrow="1"
                  width={{ sm: '250px', initial: '50vw' }}
                >
                  <Text size="2" color="gray" truncate>
                    {playingSong.name}
                  </Text>
                  <Text size="1" color="gray">
                    {playingSong.author}
                  </Text>
                </Flex>
              </Flex>
              <Grid gap="2" align="center" columns="40px 1fr 40px">
                <Flex justify="end">
                  <Duration seconds={playingSong.duration * (played / 1000)} />
                </Flex>
                <Slider
                  min={0}
                  max={1000}
                  step={1}
                  value={[played]}
                  onChangeComplete={value => {
                    setPlayed(value);

                    if (playerRef.current) {
                      playerRef.current.seekTo(value / 1000);
                    }
                  }}
                  onChange={value => {
                    setPlayed(value);
                  }}
                  style={{
                    display: 'grid',
                    flexGrow: 1,
                    gridTemplateColumns: '100%',
                    height: 'var(--progress-height)',
                    '--progress-height': isMd
                      ? 'calc(var(--space-2) * 0.75)'
                      : 'calc(var(--space-2) * 1.25)',
                  }}
                  styles={{
                    rail: {
                      backgroundColor: 'var(--gray-a3)',
                      height: 'var(--progress-height)',
                      '--progress-height': isMd
                        ? 'calc(var(--space-2) * 0.75)'
                        : 'calc(var(--space-2) * 1.25)',
                      gridColumn: 1,
                      gridRow: 1,
                    },
                    track: {
                      backgroundColor: 'var(--accent-track)',
                      gridColumn: 1,
                      gridRow: 1,
                    },
                  }}
                />
                <Flex justify="start">
                  <Duration seconds={playingSong.duration} />
                </Flex>
              </Grid>
              <Box display="none">
                <ReactPlayer
                  ref={playerRef}
                  url={playingSong.url}
                  playing={playerContext.playing}
                  onProgress={state => {
                    setPlayed(state.played * 1000);
                  }}
                  onEnded={() => {
                    playerContext.setPlaying(previous => ({
                      ...previous,
                      playing:
                        previous.currentIndex + 1 <= previous.songs.length - 1,
                      currentIndex: Math.min(
                        previous.currentIndex + 1,
                        previous.songs.length - 1
                      ),
                    }));
                  }}
                />
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};
