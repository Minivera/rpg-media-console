import { useContext, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  Flex,
  Grid,
  IconButton,
  Text,
  Slider as RedixSlider,
} from '@radix-ui/themes';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  PauseIcon,
  PlayIcon,
  ResumeIcon,
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
} from '@radix-ui/react-icons';
import Slider from 'rc-slider';
import ReactPlayer from 'react-player';

import { Duration } from '../components/Duration.jsx';
import { useIsBreakpoint } from '../hooks/useBreakpoints.jsx';

import { PlayerContext } from './PlayerContext.jsx';

export const VideoPlayer = () => {
  const playerRef = useRef(null);
  const playerContext = useContext(PlayerContext);
  const [played, setPlayed] = useState(
    playerContext ? playerContext.currentSeek : 0
  );
  const [volume, setVolume] = useState(
    playerContext ? playerContext.volume : 50
  );
  const [lastProcessedUpdate, setLastProcessedUpdate] = useState(null);

  const isMd = useIsBreakpoint('md');

  if (!playerContext) {
    throw new Error('Wrap the app inside a PlayerProvider component');
  }

  const playingSong = playerContext.songs[playerContext.currentIndex];
  useEffect(() => {
    if (playerRef.current && playerContext && !lastProcessedUpdate) {
      setLastProcessedUpdate('initial');
      playerRef.current.seekTo(playerContext.currentSeek);
      setPlayed(playerContext.currentSeek * 1000);
      setVolume(playerContext.volume);
    }

    if (
      playerRef.current &&
      playerContext &&
      playerContext.lastUpdate &&
      lastProcessedUpdate !== playerContext.lastUpdate.updateId
    ) {
      setLastProcessedUpdate(playerContext.lastUpdate.updateId);
      playerRef.current.seekTo(playerContext.currentSeek);
      setPlayed(playerContext.currentSeek * 1000);
      setVolume(playerContext.volume);
    }
  }, [playerRef, playerContext, playerContext.lastUpdate, lastProcessedUpdate]);

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
          <Flex direction="column" gap="4" align="center" justify="center">
            <Flex justify="between" gap="2" align="center">
              <IconButton
                variant="ghost"
                size="2"
                disabled={playerContext.currentIndex <= 0}
                onClick={() => {
                  playerContext.setPlaying(state => ({
                    ...state,
                    currentIndex: state.currentIndex - 1,
                    currentSeek: 0,
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

                  if (playerRef.current) {
                    playerRef.current.seekTo(playerContext.currentSeek);
                  }
                }}
              >
                {playerContext.playing ? <PauseIcon /> : <ResumeIcon />}
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
                    currentSeek: 0,
                  }));
                }}
              >
                <DoubleArrowRightIcon />
              </IconButton>
            </Flex>
            <Flex justify="between" gap="2" align="center" width="100%">
              {volume === 0 && <SpeakerOffIcon />}
              {volume <= 35 && volume > 0 && <SpeakerQuietIcon />}
              {volume <= 70 && volume > 35 && <SpeakerModerateIcon />}
              {volume > 70 && <SpeakerLoudIcon />}
              <Flex flexGrow="1">
                <RedixSlider
                  value={[volume]}
                  onValueChange={value => {
                    setVolume(value[0]);
                  }}
                  onValueCommit={value => {
                    playerContext.setPlaying(state => ({
                      ...state,
                      volume: value[0],
                    }));
                  }}
                  size="1"
                  min={0}
                  max={100}
                  step={1}
                />
              </Flex>
            </Flex>
          </Flex>
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
                      playerContext.setPlaying(previous => ({
                        ...previous,
                        currentSeek: value / 1000,
                      }));
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
                  volume={volume / 100}
                  muted={volume === 0}
                  onProgress={state => {
                    if (playerContext.playing) {
                      setPlayed(state.played * 1000);
                      playerContext.setPlaying(
                        previous => ({
                          ...previous,
                          currentSeek: state.played,
                        }),
                        false
                      );
                    }
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
                      currentSeek: 0,
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
