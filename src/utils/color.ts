export const white = 'hsl(0, 0%, 100%)'; // #ffffff (white)
export const white50 = 'hsla(0, 0%, 100%, 0.533)'; // #ffffff88
export const neutralGray100 = 'hsl(0, 0%, 100%)'; // #ffffff (white)
export const neutralGray150 = 'hsl(0, 0%, 98%)'; // #f7f7f7
export const neutralGray200 = 'hsl(0, 0%, 84%)'; // #d7d7d7
export const neutralGray300 = 'hsl(0, 0%, 81%)'; // #cfcfcf
export const neutralGray900 = 'hsl(0, 0%, 28%)'; // #494949

export const gray200 = 'hsl(0, 0%, 88%)'; // #e0e0e0

// Red tones
export const red500 = 'hsl(0, 100%, 66%)'; // #ff4f4f
export const red600 = 'hsl(0, 76%, 60%)'; // #e94646

// Green/blue tones
export const turquoise500 = 'hsl(170, 100%, 44%)'; // #00deb9
export const blueGreen700 = 'hsl(194, 39%, 29%)'; // #2d5465

export function getTextColorByBackground(backgroundHex: string): string {
  // Usuwamy znak # z koloru HEX, jeśli jest obecny
  backgroundHex = backgroundHex.replace('#', '');

  // Konwertujemy wartości HEX na odpowiednie wartości RGB
  const r = parseInt(backgroundHex.substring(0, 2), 16);
  const g = parseInt(backgroundHex.substring(2, 4), 16);
  const b = parseInt(backgroundHex.substring(4, 6), 16);

  // Obliczamy luminancję
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Wybór koloru tekstu w zależności od luminancji tła
  if (luminance < 0.2) {
    return '#FFFFFF'; // Biały tekst dla bardzo ciemnego tła
  } else if (luminance < 0.5) {
    return '#E0E0E0'; // Jasnoszary tekst dla średnio ciemnego tła
  } else if (luminance < 0.8) {
    return '#606060'; // Średnioszary tekst dla średnio jasnego tła
  } else {
    return '#404040'; // Ciemnoszary tekst dla bardzo jasnego tła
  }
}

export function getTextColor(backgroundHex: string): string {
  // Usuwamy znak # z koloru HEX, jeśli jest obecny
  backgroundHex = backgroundHex.replace('#', '');

  // Konwertujemy wartości HEX na odpowiednie wartości RGB
  const r = parseInt(backgroundHex.substring(0, 2), 16);
  const g = parseInt(backgroundHex.substring(2, 4), 16);
  const b = parseInt(backgroundHex.substring(4, 6), 16);

  // Obliczamy luminancję
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Funkcja do obliczania stosunku kontrastu
  function getContrast(
    r1: number,
    g1: number,
    b1: number,
    r2: number,
    g2: number,
    b2: number
  ): number {
    const l1 = (0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1) / 255;
    const l2 = (0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2) / 255;
    const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (light + 0.05) / (dark + 0.05);
  }

  // Definiowanie kolorów do testowania
  const colors = {
    black: { r: 0, g: 0, b: 0 },
    darkGray: { r: 64, g: 64, b: 64 },
    gray: { r: 128, g: 128, b: 128 },
    white: { r: 255, g: 255, b: 255 },
  };

  // Wybór koloru tekstu w zależności od luminancji tła
  if (luminance < 0.3) {
    return '#FFFFFF'; // Biały tekst dla bardzo ciemnego tła
  } else if (luminance < 0.6) {
    // Testowanie kontrastu dla ciemnoszarego i białego tekstu
    if (
      getContrast(
        r,
        g,
        b,
        colors.darkGray.r,
        colors.darkGray.g,
        colors.darkGray.b
      ) >= 4.5
    ) {
      return '#404040'; // Ciemnoszary tekst dla średnio ciemnego tła
    } else {
      return '#FFFFFF'; // Biały tekst jeśli ciemnoszary nie zapewnia odpowiedniego kontrastu
    }
  } else {
    // Testowanie kontrastu dla czarnego i ciemnoszarego tekstu
    if (
      getContrast(r, g, b, colors.black.r, colors.black.g, colors.black.b) >=
      4.5
    ) {
      return '#000000'; // Czarny tekst dla jasnego tła
    } else {
      return '#404040'; // Ciemnoszary tekst jeśli czarny nie zapewnia odpowiedniego kontrastu
    }
  }
}
