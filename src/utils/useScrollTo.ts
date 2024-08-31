import { useCallback } from 'react';
import { mainNavbar } from './constants';

export const useScrollToId = () => {
  const navbatHeight = document.getElementById(mainNavbar)?.offsetHeight ?? 64;

  const scrollToElement = useCallback(
    (elementId: string, offset = 0, zoom?: boolean, containerId?: string) => {
      const element = document.getElementById(elementId);
      const container = containerId
        ? document.getElementById(containerId)
        : null;

      if (element) {
        const position =
          element.getBoundingClientRect().top +
          window.scrollY -
          navbatHeight -
          offset;

        // Scrollowanie do elementu
        if (container) {
          container.scrollTo({ top: position, behavior: 'instant' });
        } else {
          window.scrollTo({ top: position, behavior: 'smooth' });
        }

        // Dodajemy klasę powiększenia

        if (zoom) {
          const timer1 = setTimeout(() => {
            element.classList.add('zoomIn');
            clearTimeout(timer1);
          }, 400);

          // Po 1 sekundzie zmieniamy klasę na zoomOut, żeby powrócił do oryginalnego rozmiaru
          const timer2 = setTimeout(() => {
            element.classList.remove('zoomIn');
            element.classList.add('zoomOut');
            clearTimeout(timer2);
          }, 1400);

          // Usuwamy klasę zoomOut po zakończeniu animacji (np. po 0.3s)
          const timer3 = setTimeout(() => {
            element.classList.remove('zoomOut');
            clearTimeout(timer3);
          }, 1700); // 1000ms (czas animacji powiększenia) + 300ms (czas powrotu do normalnego rozmiaru)
        }
      }
    },
    [navbatHeight]
  );

  return { scrollToElement };
};
