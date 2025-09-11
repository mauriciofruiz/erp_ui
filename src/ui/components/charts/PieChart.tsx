import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ChartConfiguration } from 'chart.js';

type PieChart = {
  label: string;
  labels: string[];
  data: number[];
  backgroundColor: string[];
};

export const PieChart: React.FC<PieChart> = React.memo(
  ({ label, labels, data, backgroundColor }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    const chartConfig: ChartConfiguration = {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        color: 'white',
      },
    };

    useEffect(() => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }

          chartInstanceRef.current = new Chart(ctx, chartConfig);
        }
      }
    }, [label, labels, data, backgroundColor]);

    return (
      <div style={{ width: '100%', minHeight: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    );
  }
);
