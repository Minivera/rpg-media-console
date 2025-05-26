import { createContext, useContext, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useParams } from 'wouter';
import { useLocalStorage } from 'usehooks-ts';

import { onGetPlayingState } from '../backend/state.telefunc.js';
import {
  GameState,
  gameStateFromState,
} from '../backend/liveplay/gameState.js';
import { playUpdateActions } from '../backend/liveplay/constants.js';

export const PlayerContext = createContext(undefined);

export const PlayerProvider = ({ children }) => {
  const { gameId } = useParams();
  const [actorId, setActorId] = useLocalStorage('video-player-actor-id', null);

  const [playing, setPlaying] = useState({
    loading: true,
    isListener: true,
    state: null,
    subscriber: null,
  });
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `/play-updates${actorId ? `?actor_id=${actorId}` : ''}`,
    {
      onOpen: () => console.log('Listening for play state updates'),
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    if (readyState !== ReadyState.OPEN) {
      return;
    }

    onGetPlayingState({ gameId }).then(dbState => {
      const gameState = !dbState
        ? new GameState()
        : new GameState(dbState.data);

      setPlaying(prevState => ({
        ...prevState,
        loading: false,
        isListener: gameState.actor !== actorId,
        state: gameState.state,
      }));
    });
  }, [readyState, gameId]);

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    if (lastJsonMessage.action === 'CONNECTED') {
      setActorId(lastJsonMessage.connectionId);
      return;
    }

    const updatedState = new GameState(lastJsonMessage.data);
    setPlaying(state => ({
      ...state,
      isListener: updatedState.actor !== actorId,
      state: updatedState.state,
    }));

    if (playing.subscriber) {
      playing.subscriber({
        action: lastJsonMessage.action,
        state: updatedState.state,
      });
    }
  }, [lastJsonMessage]);

  return (
    <PlayerContext.Provider
      value={{
        ...playing,
        subscribeToUpdates: subscriber => {
          setPlaying(prevState => ({
            ...prevState,
            subscriber,
          }));
        },
        updateSeek: seek => {
          sendJsonMessage({
            action: playUpdateActions.PLAYING,
            gameId,
            update: {
              seekUpdate: seek,
            },
          });
        },
        playSongs: songs => {
          const gameState = gameStateFromState(playing.state);
          gameState.startPlaying(songs);

          sendJsonMessage({
            action: playUpdateActions.PLAY,
            gameId,
            update: { songs },
          });

          // playing sends the event to all subscribers as we want to start
          // at roughly the same time.
        },
        pause: () => {
          const gameState = gameStateFromState(playing.state);
          gameState.pausePlaying();

          sendJsonMessage({
            action: playUpdateActions.PAUSE,
            gameId,
            update: {},
          });

          setPlaying(prevState => ({
            ...prevState,
            // When the user takes an action, they become an actor
            isListener: false,
            state: gameState.state,
          }));
        },
        resume: () => {
          const gameState = gameStateFromState(playing.state);
          gameState.resumePlaying();

          sendJsonMessage({
            action: playUpdateActions.RESUME,
            gameId,
            update: {},
          });

          // Resuming sends the event to all subscribers as we want to resume
          // at roughly the same time.
        },
        seek: seekPosition => {
          const gameState = gameStateFromState(playing.state);
          gameState.seekTo(seekPosition);

          sendJsonMessage({
            action: playUpdateActions.SEEK,
            gameId,
            update: { seekUpdate: seekPosition },
          });

          setPlaying(prevState => ({
            ...prevState,
            // When the user takes an action, they become an actor
            isListener: false,
            state: gameState.state,
          }));
        },
        next: () => {
          const gameState = gameStateFromState(playing.state);
          if (gameState.currentIndex + 1 <= gameState.songs.length - 1) {
            gameState.moveTo(+1);
            sendJsonMessage({
              action: playUpdateActions.NEXT,
              gameId,
              update: {},
            });
          } else {
            gameState.pausePlaying();
            sendJsonMessage({
              action: playUpdateActions.PAUSE,
              gameId,
              update: {},
            });
          }

          setPlaying(prevState => ({
            ...prevState,
            // When the user takes an action, they become an actor
            isListener: false,
            state: gameState.state,
          }));
        },
        previous: () => {
          const gameState = gameStateFromState(playing.state);
          gameState.moveTo(-1);

          sendJsonMessage({
            action: playUpdateActions.PREVIOUS,
            gameId,
            update: {},
          });

          setPlaying(prevState => ({
            ...prevState,
            // When the user takes an action, they become an actor
            isListener: false,
            state: gameState.state,
          }));
        },
        updateVolume: volume => {
          const gameState = gameStateFromState(playing.state);
          gameState.setVolume(volume);

          sendJsonMessage({
            action: playUpdateActions.UPDATE,
            gameId,
            update: {
              volume,
            },
          });

          setPlaying(prevState => ({
            ...prevState,
            // When the user takes an action, they become an actor
            isListener: false,
            state: gameState.state,
          }));
        },
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlaySongs = () => {
  const playerContext = useContext(PlayerContext);
  if (!playerContext) {
    throw new Error('Wrap the app inside a PlayerProvider component');
  }

  return songs => {
    playerContext.playSongs(songs);
  };
};
