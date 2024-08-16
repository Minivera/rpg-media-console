import { createContext, useContext, useEffect, useState } from 'react';
import {
  onGetPlayingState,
  onSavePlayingState,
} from '../backend/state.telefunc.js';

export const PlayerContext = createContext(undefined);

export const PlayerProvider = ({ children }) => {
  const [playing, setPlaying] = useState({
    loading: true,
    playing: false,
    currentIndex: 0,
    songs: [],
  });

  useEffect(() => {
    onGetPlayingState().then(data => {
      setPlaying(state => ({
        ...state,
        loading: false,
        ...data,
      }));
    });

    const interval = setInterval(() => {
      onGetPlayingState().then(data => {
        setPlaying(state => {
          return JSON.stringify(data.songs) !== JSON.stringify(state.songs) ||
            data.currentIndex !== state.currentIndex
            ? {
                ...state,
                songs: data.songs,
                currentIndex: data.currentIndex,
              }
            : state;
        });
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...playing,
        setPlaying: newOrSetter => {
          setPlaying(previous => {
            let state = newOrSetter;
            if (typeof state === 'function') {
              state = state(previous);
            }

            // Throw and forget
            onSavePlayingState({
              ...state,
              playing: false,
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
      songs,
    }));
  };
};
