'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EmotionLineChartProps {
  data: number[];
  labels?: string[];
}

export function EmotionLineChart({ data, labels }: EmotionLineChartProps) {
  const defaultLabels = labels || Array.from({ length: data.length }, (_, i) => `${(i + 1) * 5}분`);

  const chartData = {
    labels: defaultLabels,
    datasets: [
      {
        label: '감정 점수',
        data: data,
        borderColor: '#DC5F53',
        backgroundColor: 'rgba(220, 95, 83, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#DC5F53',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <div className="h-48 bg-white rounded border">
      <Line data={chartData} options={options} />
    </div>
  );
}
