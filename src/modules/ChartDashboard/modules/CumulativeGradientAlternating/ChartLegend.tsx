interface ChartDataPoint {
  date: string;
  parent1Cumulative: number;
  parent2Cumulative: number;
  backgroundType: string;
  backgroundColor: string;
  isBeforeToday: boolean;
}

interface ChartLegendProps {
  chartData: ChartDataPoint[];
  backgroundColors: {
    parent1: string;
    parent2: string;
    camp: string;
  };
}

export const ChartLegend = ({
  chartData,
  backgroundColors,
}: ChartLegendProps) => {
  return (
    <div style={{ marginTop: '16px' }}>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: backgroundColors.parent1,
              border: '1px solid #ddd',
            }}
          />
          <span>Rodzic 1</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: backgroundColors.parent2,
              border: '1px solid #ddd',
            }}
          />
          <span>Rodzic 2</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: backgroundColors.camp,
              border: '1px solid #ddd',
            }}
          />
          <span>Kolonie</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '16px',
              height: '2px',
              backgroundColor: 'red',
            }}
          />
          <span>Dziś</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
          }}
        >
          📊 Rodzic 1:{' '}
          {chartData.length > 0
            ? chartData[chartData.length - 1].parent1Cumulative
            : 0}{' '}
          dni
        </div>
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#fdf2f8',
            borderRadius: '6px',
          }}
        >
          👩‍👦 Rodzic 2:{' '}
          {chartData.length > 0
            ? chartData[chartData.length - 1].parent2Cumulative
            : 0}{' '}
          dni
        </div>
      </div>
    </div>
  );
};
