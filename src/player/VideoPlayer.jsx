import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  Flex,
  Grid,
  IconButton,
  Text,
  Slider as RedixSlider,
  Tooltip,
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
import { playUpdateActions } from '../backend/liveplay/constants.js';
import { usePlayerChrome } from '../hooks/usePlayerChrome.jsx';

import { PlayerContext } from './PlayerContext.jsx';

export const VideoPlayer = () => {
  const [playerRef, setPlayerRef] = useState(null);
  const playerRefSetter = useCallback(node => {
    if (node !== null) {
      setPlayerRef(node);
    }
  }, []);

  const playerContext = useContext(PlayerContext);
  if (!playerContext) {
    throw new Error('Wrap the VideoPlayer inside a PlayerProvider component');
  }

  const [played, setPlayed] = useState(
    playerContext.state ? playerContext.state.currentSeek : 0
  );
  const [volume, setVolume] = useState(
    playerContext.state ? playerContext.state.volume : 50
  );
  const startMuted = usePlayerChrome();

  const isMd = useIsBreakpoint('md');

  const playingSong = playerContext.state
    ? playerContext.state.songs[playerContext.state.currentIndex]
    : undefined;

  useEffect(() => {
    if (playerRef && playerContext) {
      setPlayed(playerContext.state.currentSeek * 1000);
      setVolume(playerContext.state.volume);

      playerContext.subscribeToUpdates(update => {
        if (
          update.action === playUpdateActions.SEEK ||
          update.action === playUpdateActions.RESUME ||
          update.action === playUpdateActions.PLAY
        ) {
          playerRef.seekTo(update.state.currentSeek);
          setPlayed(update.state.currentSeek * 1000);
        } else if (update.action === playUpdateActions.UPDATE) {
          setVolume(update.state.volume);
        }
      });
    }
  }, [playerRef]);

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
          <Box
            width="5px"
            height="5px"
            position="absolute"
            right="15px"
            style={{
              backgroundColor: 'var(--red-10)',
              borderRadius: '50%',
            }}
          />
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
        <Tooltip
          content={
            playerContext.isListener
              ? 'You are listening for update'
              : 'You are leading the session'
          }
        >
          <Box
            width="5px"
            height="5px"
            position="absolute"
            right="15px"
            style={{
              backgroundColor: playerContext.isListener
                ? 'var(--blue-10)'
                : 'var(--green-10)',
              borderRadius: '50%',
            }}
          />
        </Tooltip>
        <Flex justify="between" gap="2" pr="6" align="center">
          <Flex direction="column" gap="4" align="center" justify="center">
            <Flex justify="between" gap="2" align="center">
              <IconButton
                variant="ghost"
                size="2"
                disabled={playerContext.state.currentIndex <= 0}
                onClick={() => {
                  playerContext.previous();
                }}
              >
                <DoubleArrowLeftIcon />
              </IconButton>
              <IconButton
                radius="full"
                size="3"
                onClick={() => {
                  if (playerContext.state.playing) {
                    playerContext.pause();
                  } else {
                    playerContext.resume();
                    playerRef.seekTo(playerContext.state.currentSeek);
                  }
                }}
              >
                {playerContext.state.playing ? <PauseIcon /> : <ResumeIcon />}
              </IconButton>
              <IconButton
                variant="ghost"
                size="2"
                disabled={
                  playerContext.state.currentIndex >=
                  playerContext.state.songs.length - 1
                }
                onClick={() => {
                  playerContext.next();
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
                    playerContext.updateVolume(value[0]);
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
                    playerContext.seek(value / 1000);

                    if (playerRef) {
                      playerRef.seekTo(value / 1000);
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
                  ref={playerRefSetter}
                  url={playingSong.url}
                  playing={playerContext.state.playing}
                  volume={volume / 100}
                  muted={startMuted || volume === 0}
                  onReady={() => {
                    playerRef.seekTo(playerContext.state.currentSeek);
                  }}
                  onProgress={state => {
                    if (playerContext.state.playing) {
                      setPlayed(state.played * 1000);
                      playerContext.updateSeek(state.played);
                    }
                  }}
                  onEnded={() => {
                    if (playerContext.isListener) {
                      return;
                    }

                    playerContext.next();
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
