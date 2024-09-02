export const white = '#ffffff'; // #ffffff (white)
export const colorWhite50 = '#ffffff88'; // #ffffff88
export const colorNeutralGray100 = '#ffffff'; // #ffffff (white)
export const colorNeutralGray150 = '#f7f7f7'; // #f7f7f7
export const colorNeutralGray200 = '#d7d7d7'; // #d7d7d7
export const colorNeutralGray300 = '#cfcfcf'; // #cfcfcf
export const colorNeutralGray900 = '#494949'; // #494949
export const colorGray200 = '#e0e0e0'; // #e0e0e0

// Red tones
export const colorRed500 = '#ff4f4f'; //
export const colorRed600 = '#e94646'; //

// Green/blue tones
export const colorTurquoise500 = '#00deb9'; // #00deb9
export const colorBlueGreen700 = '#2d5465'; // #2d5465

export const mainNavbar = 'MAIN_NAVBAR';

export const linearGradients = {
  '#8796a2': 'linear-gradient(135deg, #8796a2, #577691)',
  '#8899a0': 'linear-gradient(135deg, #8899a0, #568090)',
  '#a396c1': 'linear-gradient(135deg, #a396c1, #836fa9)',
  '#8677b2': 'linear-gradient(135deg, #8677b2, #655791)',
  '#767eb1': 'linear-gradient(135deg, #767eb1, #565e90)',
  '#689bc5': 'linear-gradient(135deg, #689bc5, #587893)',
  '#61b7d1': 'linear-gradient(135deg, #61b7d1, #5a8997)',
  '#60d0c4': 'linear-gradient(135deg, #60d0c4, #5a8c96)',
  '#66b0b0': 'linear-gradient(135deg, #66b0b0, #4f8484)',
  '#7db281': 'linear-gradient(135deg, #7db281, #548d57)',
  '#a5bc7d': 'linear-gradient(135deg, #a5bc7d, #8aa061)',
  '#cbc875': 'linear-gradient(135deg, #cbc875, #a6a46b)',
  '#e3db85': 'linear-gradient(135deg, #e3db85, #afaa7a)',
  '#dbb274': 'linear-gradient(135deg, #dbb274, #ac9675)',
  '#df8477': 'linear-gradient(135deg, #df8477, #a8846f)',
  '#bd928b': 'linear-gradient(135deg, #bd928b, #a7726c)',
  '#4e7165': 'linear-gradient(135deg, #4e7165, #8d5b55)',
  '#768580': 'linear-gradient(135deg, #768580, #568090)',
  '#dcdcdc': 'linear-gradient(135deg, #dcdcdc, #d4b7b7)',
  '#d0dcdc': 'linear-gradient(135deg, #d0dcdc, #b1d0d0)',
  '#d2d9d0': 'linear-gradient(135deg, #d2d9d0, #b6cfaf)',
  '#dbd6ce': 'linear-gradient(135deg, #dbd6ce, #cfc2af)',
  '#dad2d4': 'linear-gradient(135deg, #dad2d4, #d0b0b8)',
  '#d9d3d9': 'linear-gradient(135deg, #d9d3d9, #d0b0d0)',
  '#d4d4d7': 'linear-gradient(135deg, #d4d4d7, #b0b0cf)',
  '#c3c7d3': 'linear-gradient(135deg, #c3c7d3, #a4adc8)',
  '#b4c8db': 'linear-gradient(135deg, #b4c8db, #a0b4c6)',
  '#a1db8c': 'linear-gradient(135deg, #a1db8c, #96b88a)',
  '#ace2e6': 'linear-gradient(135deg, #ace2e6, #a2c4c7)',
  '#e08fe0': 'linear-gradient(135deg, #e08fe0, #bb8ebb)',
};

export const colorPick = [
  '#8796a2',
  '#8899a0',
  '#a396c1',
  '#8677b2',
  '#767eb1',
  '#689bc5',
  '#61b7d1',
  '#60d0c4',
  '#66b0b0',
  '#7db281',
  '#a5bc7d',
  '#cbc875',
  '#e3db85',
  '#dbb274',
  '#df8477',
  '#bd928b',
  '#4e7165',
  '#768580',
  '#dcdcdc',
  '#d0dcdc',
  '#d2d9d0',
  '#dbd6ce',
  '#dad2d4',
  '#d9d3d9',
  '#d4d4d7',
  '#c3c7d3',
  '#b4c8db',
  '#a1db8c',
  '#ace2e6',
  '#e08fe0',
];

export const colorPickSaturated = [
  '#577691',
  '#568090',
  '#836fa9',
  '#655791',
  '#565e90',
  '#587893',
  '#5a8997',
  '#5a8c96',
  '#4f8484',
  '#548d57',
  '#8aa061',
  '#a6a46b',
  '#afaa7a',
  '#ac9675',
  '#a8846f',
  '#a7726c',
  '#8d5b55',
  '#568090',
  '#d4b7b7',
  '#b1d0d0',
  '#b6cfaf',
  '#cfc2af',
  '#d0b0b8',
  '#d0b0d0',
  '#b0b0cf',
  '#a4adc8',
  '#a0b4c6',
  '#96b88a',
  '#a2c4c7',
  '#bb8ebb',
];

export function getTextColorByBackground(backgroundHex?: string): string {
  if (!backgroundHex) {
    return '';
  }
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

export function getTextColor(
  backgroundHex?: string,
  thresholds: [number, number] = [0.35, 0.7]
): string {
  if (!backgroundHex) {
    return '';
  }

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

  // Funkcja liniowej interpolacji (przejście między dwoma kolorami)
  function lerp(color1: string, color2: string, t: number): string {
    const c1 = parseInt(color1.substring(1), 16);
    const c2 = parseInt(color2.substring(1), 16);

    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;

    const r = Math.round(r1 + t * (r2 - r1));
    const g = Math.round(g1 + t * (g2 - g1));
    const b = Math.round(b1 + t * (b2 - b1));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Definiowanie kolorów
  const colors = {
    black: '#000000',
    darkGray: '#404040',
    gray: '#808080',
    white: '#FFFFFF',
  };

  // Pobieranie progów
  const [lowThreshold, highThreshold] = thresholds;

  // Wybór koloru tekstu na podstawie luminancji i kontrastu
  if (luminance < lowThreshold) {
    return colors.white; // Biały tekst dla bardzo ciemnego tła
  } else if (luminance >= lowThreshold && luminance < highThreshold) {
    // Stopniowe przejście między białym a ciemnoszarym w zakresie progów
    const contrast = getContrast(r, g, b, 64, 64, 64);
    if (contrast >= 4.5) {
      const t = (luminance - lowThreshold) / (highThreshold - lowThreshold); // t z przedziału [0, 1]
      return lerp(colors.white, colors.darkGray, t);
    } else {
      return colors.white; // Zbyt niski kontrast, wybieramy biały tekst
    }
  } else {
    // Jasne tła: przejście między ciemnoszarym a czarnym
    const contrast = getContrast(r, g, b, 0, 0, 0);
    if (contrast >= 4.5) {
      const t = (luminance - highThreshold) / (1 - highThreshold); // t z przedziału [0, 1]
      return lerp(colors.darkGray, colors.black, t);
    } else {
      return colors.darkGray; // Zbyt niski kontrast, wybieramy ciemnoszary tekst
    }
  }
}
