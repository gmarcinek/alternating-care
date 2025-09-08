interface ChartDataPoint {
  date: string;
  parent1Cumulative: number;
  parent2Cumulative: number;
  backgroundType: string;
  backgroundColor: string; // np. "#2196F3" albo "rgba(33,150,243,1)"
  isBeforeToday: boolean;
}

interface GradientBackgroundProps {
  chartData: ChartDataPoint[];
  className?: string;
}

export const GradientBackground = ({
  chartData,
  className,
}: GradientBackgroundProps) => {
  // --- lokalne, minimalne helpery (nie zmieniam istniejących globalnych) ---
  const toHex = (color: string): string => {
    if (!color) return '#000000';
    if (color.startsWith('#')) return color;
    if (color.startsWith('rgb')) {
      const m = color.match(
        /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i
      );
      if (m) {
        const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
        const toH = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toH(r)}${toH(g)}${toH(b)}`;
      }
    }
    return color;
  };

  const hexToRgba = (hex: string, a = 1): string => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  // helper: mieszanie koloru z bielą (amount: 0 = oryginał, 1 = biały)
  const mixWithWhite = (hex: string, amount: number): string => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const mix = (c: number) =>
      Math.round(c * (1 - amount) + 255 * amount)
        .toString(16)
        .padStart(2, '0');
    return `#${mix(r)}${mix(g)}${mix(b)}`;
  };
  // -------------------------------------------------------------------------

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        zIndex: 1,
        pointerEvents: 'none',
      }}
      className={className}
    >
      {chartData.map((day, index) => {
        const width = `${100 / chartData.length}%`;
        const baseHex = toHex(day.backgroundColor);
        // mieszamy z bielą 30%
        const mixedHexTop = mixWithWhite(baseHex, 0.85);
        const mixedHexMiddle = mixWithWhite(baseHex, 0.6);
        const mixedHexBottom = mixWithWhite(baseHex, 0.3);
        const bottom = hexToRgba(mixedHexBottom, day.isBeforeToday ? 1 : 0.2);

        return (
          <div
            key={index}
            style={{
              width,
              height: '100%',
              backgroundImage: day.isBeforeToday
                ? `linear-gradient(to bottom, ${mixedHexTop} 0%, ${mixedHexMiddle} 60%, ${bottom} 100%)`
                : `linear-gradient(to bottom, ${mixedHexTop} 0%, ${bottom} 100%)`,
            }}
            title={`${day.date} - ${
              day.backgroundType === 'camp'
                ? 'Kolonie'
                : day.backgroundType === 'parent1'
                  ? 'Rodzic 1'
                  : 'Rodzic 2'
            }`}
          />
        );
      })}
    </div>
  );
};
