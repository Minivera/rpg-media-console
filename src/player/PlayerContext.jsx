import { createContext, useContext, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { onGetPlayingState } from '../backend/state.telefunc.js';

export const PlayerContext = createContext(undefined);

export const PlayerProvider = ({ children }) => {
  const [playing, setPlaying] = useState({
    loading: true,
    playing: false,
    currentIndex: 0,
    currentSeek: 0,
    volume: 50,
    songs: [],
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const { sendJsonMessage, lastJsonMessage } = useWebSocket('/play-updates', {
    onOpen: () => console.log('Listening for play state updates'),
    shouldReconnect: () => true,
  });

  /*useEffect(() => {
    onGetPlayingState().then(data => {
      setPlaying(state => ({
        ...state,
        loading: false,
        ...data,
      }));
    });
  }, []);

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    setPlaying(state => ({
      ...state,
      songs: lastJsonMessage.songs,
      currentIndex: lastJsonMessage.currentIndex,
      currentSeek: lastJsonMessage.currentSeek,
      volume: lastJsonMessage.volume,
      playing: lastJsonMessage.playing,
    }));
    setLastUpdate(lastJsonMessage);
  }, [lastJsonMessage]);*/

  return (
    <PlayerContext.Provider
      value={{
        ...playing,
        lastUpdate,
        setPlaying: (newOrSetter, shouldBroadcast = true) => {
          setPlaying(previous => {
            let state = newOrSetter;
            if (typeof state === 'function') {
              state = state(previous);
            }

            sendJsonMessage({
              update: state,
              broadcast: shouldBroadcast,
            });

            return state;
          });
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
    playerContext.setPlaying(previousState => ({
      ...previousState,
      playing: true,
      currentIndex: 0,
      currentSeek: 0,
      songs,
    }));
  };
};
