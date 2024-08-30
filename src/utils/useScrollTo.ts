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

        // Scrollowanie do elementu
        window.scrollTo({ top: position, behavior: 'smooth' });

        // Dodajemy klasę powiększenia

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

  return { scrollToElement };
};
