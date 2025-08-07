'use client';

import { CalendarEvent } from '@api/db/types';
import { Stack } from '@components/Stack/Stack';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Spinner,
} from '@nextui-org/react';
import { useCarePatternAnalysis } from '../hooks/useCarePatternAnalysis';
import { CarePattern } from '../utils/carePatternAnalysis';

interface CarePatternWidgetProps {
  events: CalendarEvent[];
  isPending?: boolean;
}

export const CarePatternWidget = ({
  events,
  isPending,
}: CarePatternWidgetProps) => {
  const { patterns, statistics, isAnalyzing } = useCarePatternAnalysis({
    events,
  });

  if (isPending || isAnalyzing) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <h3>Wzorce Opieki</h3>
        </CardHeader>
        <CardBody>
          <Stack contentAlignment='center' style={{ minHeight: '200px' }}>
            <Spinner size='lg' />
            <p>Analizuję wzorce opieki...</p>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  if (!patterns || patterns.length === 0) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <h3>Wzorce Opieki</h3>
        </CardHeader>
        <CardBody>
          <Stack contentAlignment='center' style={{ minHeight: '200px' }}>
            <p>Brak wystarczających danych do analizy wzorców</p>
            <small className='text-gray-500'>
              Potrzeba co najmniej 3 okresów opieki ALTERNATING
            </small>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Stack>
      <div className='w-full'>
        <div className='mb-1 flex items-center justify-between'>
          <h2>Wykryte Wzorce Opieki</h2>
          <Chip size='sm' variant='flat' color='primary'>
            {patterns.length} wzorców
          </Chip>
        </div>
        <small className='text-gray-500'>
          Analiza {statistics.totalCarePeriods} okresów opieki
        </small>
      </div>

      <div className='space-y-8'>
        {/* Statystyki ogólne */}
        <div>
          <h4 className='mb-2 text-sm font-semibold'>Podstawowe Statystyki</h4>
          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span>Średnia opieka:</span>
                <strong>{statistics.averageCareDuration} dni</strong>
              </div>
              <div className='flex justify-between'>
                <span>Średnia przerwa:</span>
                <strong>{statistics.averageBreakDuration} dni</strong>
              </div>
              <div className='flex justify-between'>
                <span>Stosunek opieka:przerwa:</span>
                <strong>{statistics.careToBreakRatio}:1</strong>
              </div>
            </div>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span>Najdłuższa opieka:</span>
                <strong>{statistics.longestCarePeriod} dni</strong>
              </div>
              <div className='flex justify-between'>
                <span>Najkrótsza opieka:</span>
                <strong>{statistics.shortestCarePeriod} dni</strong>
              </div>
              <div className='flex justify-between'>
                <span>Najdłuższa przerwa:</span>
                <strong>{statistics.longestBreak} dni</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Okres analizy */}
        <div>
          <h4 className='mb-2 text-sm font-semibold'>Okres Analizy</h4>
          <div className='text-sm text-gray-600'>
            <div>Od: {statistics.analysisDateRange.start}</div>
            <div>Do: {statistics.analysisDateRange.end}</div>
            <div>Łącznie: {statistics.analysisDateRange.totalDays} dni</div>
          </div>
        </div>

        {/* Wykryte wzorce */}
        <div>
          <h4 className='mb-3 text-sm font-semibold'>Wykryte Wzorce</h4>
          <div className='grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3'>
            {patterns.map((pattern, index) => (
              <PatternCard key={index} pattern={pattern} />
            ))}
          </div>
        </div>
      </div>
    </Stack>
  );
};

// Komponent dla pojedynczego wzorca
interface PatternCardProps {
  pattern: CarePattern;
}

const PatternCard = ({ pattern }: PatternCardProps) => {
  return (
    <div className='space-y-3 rounded-lg border p-4'>
      {/* Header wzorca */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <Chip size='sm' variant='flat' color={getPatternColor(pattern.type)}>
            {getPatternTypeLabel(pattern.type)}
          </Chip>
          <span className='text-sm font-medium'>{pattern.description}</span>
        </div>
        <div className='text-right'>
          <div className='text-xs text-gray-500'>Pewność</div>
          <div className='text-sm font-medium'>
            {Math.round(pattern.confidence * 100)}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress
        value={pattern.confidence * 100}
        color={getPatternColor(pattern.type)}
        size='sm'
      />

      {/* Szczegóły wzorca */}
      <div className='text-xs text-gray-600'>{pattern.details}</div>

      {/* Charakterystyki wzorca */}
      <PatternCharacteristics pattern={pattern} />
    </div>
  );
};

// Charakterystyki wzorca
interface PatternCharacteristicsProps {
  pattern: CarePattern;
}

const PatternCharacteristics = ({ pattern }: PatternCharacteristicsProps) => {
  switch (pattern.type) {
    case 'duration':
      return (
        <div className='space-y-1 rounded bg-gray-50 p-2 text-xs'>
          <div className='font-medium'>
            Wzorzec długości ({pattern.category}):
          </div>
          <div className='text-grey-600 text-lg font-bold'>
            {pattern.characteristics.mostCommonDuration} dni
          </div>
          <div>
            Zakres: {pattern.characteristics.durationRange.min}-
            {pattern.characteristics.durationRange.max} dni
          </div>
          <div className='text-gray-500'>
            Średnia: {pattern.characteristics.averageDuration} dni
          </div>
        </div>
      );

    case 'cycle':
      return (
        <div className='space-y-1 rounded bg-gray-50 p-2 text-xs'>
          <div className='font-medium'>Charakterystyki cyklu:</div>
          <div className='text-lg font-bold text-blue-600'>
            Długość cyklu: {pattern.characteristics.cycleLength} dni
          </div>
          <div>
            Stosunek opieka:przerwa: {pattern.characteristics.careToBreakRatio}
            :1
          </div>
          <div>
            Regularność: {Math.round(pattern.characteristics.regularity * 100)}%
          </div>
        </div>
      );

    case 'weekly':
      return (
        <div className='space-y-2 rounded bg-gray-50 p-2 text-xs'>
          <div className='font-medium'>Preferencje tygodniowe:</div>
          <div>
            <div className='mb-1 font-medium'>Dni rozpoczęcia:</div>
            {pattern.characteristics.preferredStartDays
              .slice(0, 1)
              .map((day, i) => (
                <div key={i} className='flex justify-between'>
                  <span>{day.dayName}</span>
                  <span>{Math.round(day.frequency * 100)}%</span>
                </div>
              ))}
          </div>
          <div>
            <div className='mb-1 font-medium'>Dni zakończenia:</div>
            {pattern.characteristics.preferredEndDays
              .slice(0, 1)
              .map((day, i) => (
                <div key={i} className='flex justify-between'>
                  <span>{day.dayName}</span>
                  <span>{Math.round(day.frequency * 100)}%</span>
                </div>
              ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

// Helper functions
function getPatternTypeLabel(type: CarePattern['type']): string {
  const labels: Record<CarePattern['type'], string> = {
    duration: 'Długość',
    weekly: 'Tygodniowy',
    cycle: 'Cykliczny',
  };
  return labels[type];
}

function getPatternColor(
  type: CarePattern['type']
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  const colors: Record<
    CarePattern['type'],
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  > = {
    duration: 'default',
    weekly: 'success',
    cycle: 'primary',
  };
  return colors[type];
}
