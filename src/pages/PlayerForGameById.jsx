import {
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';
import { Box, Card, Container, Flex, Grid } from '@radix-ui/themes';
import ReactPlayer from 'react-player';
import Slider from 'rc-slider';

import { PlayerContext, PlayerProvider } from '../player/PlayerContext.jsx';
import { playUpdateActions } from '../backend/liveplay/constants.js';
import { Duration } from '../components/Duration.jsx';
import {
  PauseIcon,
  ResumeIcon,
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
} from '@radix-ui/react-icons';
import { useIsBreakpoint } from '../hooks/useBreakpoints.jsx';
import { usePlayerChrome } from '../hooks/usePlayerChrome.jsx';

export const PlayerForGameById = () => {
  return (
    <PlayerProvider>
      <FullPagePlayer />
    </PlayerProvider>
  );
};

export const FullPagePlayer = () => {
  const [playerRef, setPlayerRef] = useState(null);
  const playerRefSetter = useCallback(node => {
    if (node !== null) {
      setPlayerRef(node);
    }
  }, []);

  const playerContext = useContext(PlayerContext);
  if (!playerContext) {
    throw new Error(
      'Wrap the FullPagePlayer inside a PlayerProvider component'
    );
  }

  const [played, setPlayed] = useState(
    playerContext.state ? playerContext.state.currentSeek : 0
  );
  const [volume, setVolume] = useState(
    playerContext.state ? playerContext.state.volume : 50
  );
  const startMuted = usePlayerChrome();
  const [isShowingIndicator, startShowingIndicator] = useTransition();

  const playingSong = playerContext.state
    ? playerContext.state.songs[playerContext.state.currentIndex]
    : undefined;

  const isMd = useIsBreakpoint('md');

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

        if (
          update.action === playUpdateActions.RESUME ||
          update.action === playUpdateActions.PAUSE ||
          update.action === playUpdateActions.PLAY
        ) {
          startShowingIndicator(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
          });
        }
      });
    }
  }, [playerRef]);

  return (
    <Flex minHeight="100vh" minWidth="100vw" direction="column">
      <Flex direction="column" gap="7" height="100vh">
        <Box position="relative" height="100%">
          <Box
            position="absolute"
            inset="0"
            m="3"
            style={{
              pointerEvents: 'none',
            }}
          >
            {playingSong && (
              <ReactPlayer
                ref={playerRefSetter}
                height="100%"
                width="100%"
                url={playingSong.url}
                playing={playerContext.state.playing}
                volume={volume / 100}
                muted={startMuted || volume === 0}
                playsInline
                onReady={() => {
                  playerRef.seekTo(playerContext.state.currentSeek);
                }}
                onProgress={state => {
                  if (playerContext.state.playing) {
                    setPlayed(state.played * 1000);
                  }
                }}
              />
            )}
          </Box>
          {playerContext.state && (
            <Box position="absolute" inset="50%">
              <Box
                width="4rem"
                height="4rem"
                style={{
                  borderRadius: '50%',
                  backgroundColor: 'var(--gray-a8)',
                  color: 'var(--gray-1)',
                  opacity: isShowingIndicator ? 1 : 0,
                  transition: 'opacity ease 300ms',
                }}
              >
                <Flex justify="center" align="center" height="100%">
                  {!playerContext.state.playing ? (
                    <PauseIcon width="1.5rem" height="1.5rem" />
                  ) : (
                    <ResumeIcon width="1.5rem" height="1.5rem" />
                  )}
                </Flex>
              </Box>
            </Box>
          )}
          <Box position="absolute" bottom="2" right="2" left="2">
            <Card>
              <Flex direction="row" gap="2" justify="center" align="center">
                <Flex>
                  {volume === 0 && <SpeakerOffIcon />}
                  {volume <= 35 && volume > 0 && <SpeakerQuietIcon />}
                  {volume <= 70 && volume > 35 && <SpeakerModerateIcon />}
                  {volume > 70 && <SpeakerLoudIcon />}
                </Flex>
                <Grid
                  gap="2"
                  align="center"
                  columns="40px 1fr 40px"
                  width={isMd ? '50vw' : '80vw'}
                >
                  <Flex justify="end">
                    <Duration
                      seconds={
                        playingSong ? playingSong.duration * (played / 1000) : 0
                      }
                    />
                  </Flex>
                  <Slider
                    min={0}
                    max={1000}
                    step={1}
                    value={[played]}
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
                    <Duration
                      seconds={playingSong ? playingSong.duration : 0}
                    />
                  </Flex>
                </Grid>
              </Flex>
            </Card>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};
