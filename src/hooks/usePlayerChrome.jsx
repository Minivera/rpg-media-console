import { useEffect, useState } from 'react';
import { detect } from 'detect-browser';

const browser = detect();

export const usePlayerChrome = () => {
  const [chromeMuted, setChromedMuted] = useState(browser.name === 'chrome');

  useEffect(() => {
    const handleClick = () => {
      setChromedMuted(false);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  });

  return chromeMuted;
};
