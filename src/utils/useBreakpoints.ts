import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';

/**
 * Niestandardowy hak `useBreakpoints` dostarcza wartości logiczne, które wskazują, czy aktualny widok
 * pasuje do jednego z kilku przedziałów rozmiarów ekranów: mobilnego, tabletu, desktopu oraz dużego desktopu.
 *
 * Hak wykorzystuje `useMediaQuery` z biblioteki `react-responsive` do monitorowania zmian w szerokości okna
 * przeglądarki i dostarczania odpowiednich wartości dla różnych punktów przerwania (breakpoints).
 *
 * @returns {Object} Obiekt zawierający właściwości logiczne, które informują o aktualnym rozmiarze ekranu:
 * - `isMobile` (boolean): `true`, jeśli szerokość okna przeglądarki jest mniejsza lub równa 767px.
 * - `isTablet` (boolean): `true`, jeśli szerokość okna przeglądarki jest mniejsza lub równa 1023px.
 * - `isDesktop` (boolean): `true`, jeśli szerokość okna przeglądarki jest mniejsza lub równa 1280px.
 * - `isBigDesktop` (boolean): `true`, jeśli szerokość okna przeglądarki jest większa lub równa 1281px.
 *
 * @example
 * // Przykład użycia haka
 * import React from 'react';
 * import { useBreakpoints } from './useBreakpoints'; // Załóżmy, że hak jest zapisany w pliku `useBreakpoints.ts`
 *
 * const MyComponent: React.FC = () => {
 *   const { isMobile, isTablet, isDesktop, isBigDesktop } = useBreakpoints();
 *
 *   return (
 *     <div>
 *       {isMobile && <p>Jesteś na urządzeniu mobilnym.</p>}
 *       {isTablet && !isMobile && <p>Jesteś na tablecie.</p>}
 *       {isDesktop && !isTablet && !isMobile && <p>Jesteś na desktopie.</p>}
 *       {isBigDesktop && <p>Jesteś na dużym desktopie.</p>}
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 */
export const useBreakpoints = () => {
  // Używamy useMediaQuery do monitorowania punktów przerwania
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const isTablet = useMediaQuery({
    query: '(max-width: 1023px)',
  });
  const isDesktop = useMediaQuery({
    query: '(max-width: 1280px)',
  });
  const isBigDesktop = useMediaQuery({ query: '(min-width: 1281px)' });

  const api = useMemo(() => {
    return {
      isMobile,
      isTablet,
      isDesktop,
      isBigDesktop,
    };
  }, [isMobile, isTablet, isDesktop, isBigDesktop]);

  return {
    ...api,
  };
};
