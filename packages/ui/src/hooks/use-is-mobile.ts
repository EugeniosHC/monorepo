import { useEffect, useState } from "react";

export const useIsMobile = () => {
  const [width, setWidth] = useState<number | undefined>(undefined);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    // Initialize width after component mounts (client-side only)
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {}, []);

  const isMobile = width !== undefined ? width <= 768 : false;
  const isTablet = width !== undefined ? width <= 1024 : false;
  const isDesktop = width !== undefined ? width > 1024 : false;

  return { isMobile, isTablet, isDesktop };
};
