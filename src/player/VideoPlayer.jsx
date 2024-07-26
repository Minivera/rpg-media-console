import { useContext } from 'react';
import {
  Avatar,
  Box,
  Card,
  Flex,
  IconButton,
  Progress,
  Text,
} from '@radix-ui/themes';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  PauseIcon,
  PlayIcon,
} from '@radix-ui/react-icons';

import { Duration } from '../components/Duration.jsx';

import { PlayerContext } from './PlayerContext.jsx';

export const VideoPlayer = () => {
  const playerContext = useContext(PlayerContext);
  if (!playerContext) {
    throw new Error('Wrap the app inside a PlayerProvider component');
  }

  const playingSong = playerContext.songs[playerContext.currentIndex];

  return (
    <Box position="fixed" right="0" bottom="2" mr="-2" width="450px">
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
          {playingSong && (
            <Flex gap="3" align="center" flexGrow="1" ml="2">
              <Avatar
                src={playingSong.image}
                fallback={playingSong.originalName}
              />
              <Flex
                direction="column"
                flexGrow="1"
                width="200px"
                overflowX="hidden"
              >
                <Text size="2" color="gray" wrap="nowrap">
                  {playingSong.name}
                </Text>
                <Text size="1" color="gray">
                  {playingSong.author}
                </Text>
                <Progress color="gray" value={100} />
              </Flex>
              <Flex justify="center" align="center">
                <Duration seconds={playingSong.duration}>
                  {playingSong.duration}
                </Duration>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Card>
    </Box>
  );
};
