import { createContext, useContext, useState } from 'react';

export const PlayerContext = createContext(undefined);

export const PlayerProvider = ({ children }) => {
  const [playing, setPlaying] = useState({
    playing: false,
    currentIndex: 0,
    songs: [],
  });

  return (
    <PlayerContext.Provider
      value={{
        ...playing,
        setPlaying,
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
    playerContext.setPlaying({
      playing: true,
      currentIndex: 0,
      songs,
    });
  };
};
