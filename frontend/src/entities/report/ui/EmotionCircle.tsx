// /widgets/Charts/EmotionCircle.tsx
'use client';
import React from 'react';

interface Props {
  valence: string; // 'positive' | 'neutral' | 'negative'
  arousal: string; // 'high' | 'low'
}

export default function EmotionCircle({ valence, arousal }: Props) {
  const x = valence === 'positive' ? 75 : valence === 'negative' ? 25 : 50;
  const y = arousal === 'high' ? 25 : arousal === 'low' ? 75 : 50;

  return (
    <div className="relative w-64 h-64 mx-auto">
      <div className="w-full h-full rounded-full border-2 border-gray-300" />
      <div
        className="absolute w-3 h-3 bg-orange-500 rounded-full"
        style={{
          top: `${y}%`,
          left: `${x}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-base text-gray-500">비각성</div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-base text-gray-500">각성</div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 text-base text-gray-500">불쾌</div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-base text-gray-500">유쾌</div>
    </div>
  );
}
