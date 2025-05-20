'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EmotionEntry {
  messageOrder: number;
  emotion: {
    happiness: number;
    sadness: number;
    angry: number;
    neutral: number;
    other: number;
  };
}

interface Props {
  emotionList: EmotionEntry[];
  focusEmotion?: keyof EmotionEntry['emotion'];
}

const emotionKeys = ['happiness', 'sadness', 'angry', 'neutral', 'other'] as const;
type EmotionKey = (typeof emotionKeys)[number];

const emotionLabelMap: Record<EmotionKey, string> = {
  happiness: '기쁨',
  sadness: '슬픔',
  angry: '분노',
  neutral: '중립',
  other: '기타',
};

const emotionColorMap: Record<EmotionKey, string> = {
  happiness: '#f97316',
  sadness: '#60a5fa',
  angry: '#f43f5e',
  neutral: '#a3a3a3',
  other: '#34d399',
};

export default function EmotionLineChart({ emotionList, focusEmotion }: Props) {
  const data = emotionList.map((e) => ({
    name: `메시지${e.messageOrder}`,
    ...e.emotion,
  }));

  const keysToRender = focusEmotion ? [focusEmotion] : emotionKeys;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        {keysToRender.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={emotionLabelMap[key]}
            stroke={emotionColorMap[key]}
            strokeWidth={2}
            dot
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
