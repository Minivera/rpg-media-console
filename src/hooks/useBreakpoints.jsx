import { useState, useEffect } from 'react';

const breakpoints = {
  initial: 0,
  xs: 520,
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1640,
};

export const useIsBreakpoint = breakpoint => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize.width >= breakpoints[breakpoint];
};
