import { hslToHex, reduceSaturation } from '@utils/color';
import React, { useState } from 'react';

interface ColorPickerProps {
  onColorChange: (color: string) => void;
  hueHeight?: number;
}

const getHueColor = (position: number, width: number): string => {
  const hue = Math.round((position / width) * 360 * 100) / 100; // Zaokrąglamy do 2 miejsc po przecinku
  return `hsl(${hue}, 100%, 50%)`;
};

const getBrightnessColor = (hue: number, brightness: number): string => {
  return `hsl(${hue}, 100%, ${brightness}%)`;
};

export const ColorPicker = (props: ColorPickerProps) => {
  const { onColorChange, hueHeight } = props;
  const [selectedHue, setSelectedHue] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>('');

  const updateColor = (position: number, width: number) => {
    const hueColor = getHueColor(position, width);
    const hue = parseFloat(hueColor.match(/\d+(\.\d+)?/)?.[0] || '0');
    const hexColor = hslToHex(hueColor);
    setSelectedHue(hue);
    setSelectedColor(hexColor);
    onColorChange(reduceSaturation(hexColor, 15));
  };

  const handleInteraction = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    const isTouchEvent = 'touches' in e;
    const position = isTouchEvent
      ? e.touches[0].clientX - e.currentTarget.getBoundingClientRect().left
      : e.nativeEvent.offsetX;
    const width = e.currentTarget.clientWidth;
    updateColor(position, width);
  };

  const brightnessLevels: number[] = [85, 70, 50, 40, 30];

  return (
    <div style={{ width: '100%' }}>
      {/* Pasek HUE */}
      <div
        onMouseDown={handleInteraction}
        onMouseMove={(e) => e.buttons === 1 && handleInteraction(e)}
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
        style={{
          width: '100%',
          height: '24px',
          background: `linear-gradient(to right, 
                ${reduceSaturation('#ff0000', 10)},
                ${reduceSaturation('#ffff00', 10)},
                ${reduceSaturation('#00ff00', 10)},
                ${reduceSaturation('#00ffff', 10)},
                ${reduceSaturation('#0000ff', 10)},
                ${reduceSaturation('#ff00ff', 10)},
                ${reduceSaturation('#ff0000', 10)}
            )`,
          cursor: 'pointer',
        }}
      ></div>

      {/* Pasek jasności */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
        }}
      >
        {brightnessLevels.map((brightness) => (
          <div
            key={brightness}
            onClick={() =>
              onColorChange(
                reduceSaturation(
                  hslToHex(getBrightnessColor(selectedHue, brightness)),
                  10
                )
              )
            }
            style={{
              width: '20%',
              height: '24px',
              margin: '1px',
              backgroundColor: reduceSaturation(
                hslToHex(getBrightnessColor(selectedHue, brightness)),
                15
              ),
              cursor: 'pointer',
            }}
          ></div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {brightnessLevels.map((brightness) => (
          <div
            key={brightness}
            onClick={() =>
              onColorChange(
                reduceSaturation(
                  hslToHex(getBrightnessColor(selectedHue, brightness)),
                  40
                )
              )
            }
            style={{
              width: '20%',
              height: '24px',
              margin: '1px',
              backgroundColor: reduceSaturation(
                hslToHex(getBrightnessColor(selectedHue, brightness)),
                40
              ),
              cursor: 'pointer',
            }}
          ></div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {brightnessLevels.map((brightness) => (
          <div
            key={brightness}
            onClick={() =>
              onColorChange(
                reduceSaturation(
                  hslToHex(getBrightnessColor(selectedHue, brightness)),
                  80
                )
              )
            }
            style={{
              width: '20%',
              height: '24px',
              margin: '1px',
              backgroundColor: reduceSaturation(
                hslToHex(getBrightnessColor(selectedHue, brightness)),
                80
              ),
              cursor: 'pointer',
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
