import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

type BarChartProps = {
  label: string;
  labels: string[];
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth?: number;
};

export const BarChart: React.FC<BarChartProps> = React.memo(
  ({ label, labels, data, backgroundColor, borderColor, borderWidth = 1 }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }

          chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels,
              datasets: [
                {
                  label,
                  data,
                  backgroundColor,
                  borderColor,
                  borderWidth,
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
    }, [label, labels, data, backgroundColor, borderColor, borderWidth]);

    return (
      <div style={{ width: '100%', minHeight: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    );
  }
);
