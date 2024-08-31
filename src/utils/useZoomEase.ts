import { useCallback } from 'react';
import { mainNavbar } from './constants';

export const useZoomEase = () => {
  const navbatHeight = document.getElementById(mainNavbar)?.offsetHeight ?? 64;

  const zoomEaseElement = useCallback(
    (elementId: string, offset = 0) => {
      const element = document.getElementById(elementId);

      if (element) {
        setTimeout(() => {
          element.classList.add('zoomIn');
        }, 400);

        // Po 1 sekundzie zmieniamy klasę na zoomOut, żeby powrócił do oryginalnego rozmiaru
        setTimeout(() => {
          element.classList.remove('zoomIn');
          element.classList.add('zoomOut');
        }, 1400);

        // Usuwamy klasę zoomOut po zakończeniu animacji (np. po 0.3s)
        setTimeout(() => {
          element.classList.remove('zoomOut');
        }, 1700); // 1000ms (czas animacji powiększenia) + 300ms (czas powrotu do normalnego rozmiaru)
      }
    },
    [navbatHeight]
  );

  return { zoomEaseElement };
};
