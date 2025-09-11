import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

type AreaChartProps = {
  label: string;
  labels: string[];
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth?: number;
  fill?: boolean;
};
export const AreaChart: React.FC<AreaChartProps> = React.memo(
  ({
    label,
    labels,
    data,
    backgroundColor,
    borderColor,
    borderWidth = 1,
    fill = true,
  }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const divRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }

          chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label,
                  data,
                  backgroundColor,
                  borderColor,
                  borderWidth,
                  fill,
                },
              ],
            },
            options: {
              maintainAspectRatio: false, // Permite al gráfico ocupar todo el tamaño del contenedor
              color: 'white',
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: 'white',
                  },
                },
                x: {
                  ticks: {
                    color: 'white',
                  },
                },
              },
            },
          });
        }
      }
    }, [labels, data, backgroundColor, borderColor, borderWidth, fill]);

    return (
      <div ref={divRef} style={{ width: '100%', minHeight: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    );
  }
);
