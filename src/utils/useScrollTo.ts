import { useCallback } from 'react';
import { mainNavbar } from './constants';

export const useScrollToId = () => {
  const navbatHeight = document.getElementById(mainNavbar)?.offsetHeight ?? 64;

  const scrollToElement = useCallback(
    (elementId: string, offset = 0) => {
      const element = document.getElementById(elementId);

      if (element) {
        const position =
          element.getBoundingClientRect().top +
          window.scrollY -
          navbatHeight -
          offset;

        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    },
    [navbatHeight, window.scrollTo]
  );

  return { scrollToElement };
};
