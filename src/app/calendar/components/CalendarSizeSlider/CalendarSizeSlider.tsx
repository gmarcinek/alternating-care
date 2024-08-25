import { Slider } from '@nextui-org/react';
import { Dispatch, SetStateAction, useCallback } from 'react';

interface SliderProps {
  step?: number;
  showMarks?: boolean;
  onChange?: Dispatch<SetStateAction<number>>;
}

const marks = [
  {
    label: '1',
    value: 1,
  },
  {
    label: '7',
    value: 2,
  },
  {
    label: '14',
    value: 3,
  },
];

export const CalendarSizeSlider = (props: SliderProps) => {
  const { step = 1, showMarks = undefined, onChange = () => {} } = props;

  const handleSliderChange = useCallback(
    (value: number | number[]) => {
      switch (value) {
        case 1:
          return onChange(1);
        case 2:
          return onChange(7);
        case 3:
          return onChange(14);
      }
    },
    [onChange]
  );

  return (
    <Slider
      step={step}
      color='danger'
      marks={showMarks ? marks : undefined}
      onChange={handleSliderChange}
      aria-label='slider'
      showSteps
      minValue={1}
      maxValue={3}
      defaultValue={2}
    />
  );
};
