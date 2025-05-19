'use client';
import React from 'react';

interface EmotionCircleProps {
  valence: number; // -1 ~ 1 (가로축)
  arousal: number; // -1 ~ 1 (세로축)
}

export function EmotionCircle({ valence, arousal }: EmotionCircleProps) {
  const width = 280;
  const height = 280;
  const radius = 120;
  const centerX = width / 2;
  const centerY = height / 2;

  const x = centerX + valence * radius;
  const y = centerY - arousal * radius;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height}>
        {/* 배경 원 */}
        <circle cx={centerX} cy={centerY} r={radius} fill="#FAE9DE" opacity={0.3} />

        {/* 중심 십자선 */}
        <line x1={centerX} y1={centerY - radius} x2={centerX} y2={centerY + radius} stroke="#DC5F53" strokeWidth={1} />
        <line x1={centerX - radius} y1={centerY} x2={centerX + radius} y2={centerY} stroke="#DC5F53" strokeWidth={1} />

        {/* 사분면 점선 */}
        {[
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ].map(([vx, vy], i) => (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={centerX + (vx * radius) / Math.SQRT2}
            y2={centerY - (vy * radius) / Math.SQRT2}
            stroke="#DC5F53"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ))}

        {/* 레이블 */}
        <text x={centerX} y={centerY - radius - 10} fontSize="12" textAnchor="middle">
          각성 ↑
        </text>
        <text x={centerX} y={centerY + radius + 20} fontSize="12" textAnchor="middle">
          ↓ 비각성
        </text>
        <text x={centerX - radius - 10} y={centerY + 5} fontSize="12" textAnchor="end">
          ← 부정
        </text>
        <text x={centerX + radius + 10} y={centerY + 5} fontSize="12" textAnchor="start">
          긍정 →
        </text>

        {/* 감정 단어 위치 */}
        <text x={centerX + radius * 0.7} y={centerY - radius * 0.7} fontSize="11" textAnchor="middle">
          기쁨
        </text>
        <text x={centerX - radius * 0.7} y={centerY - radius * 0.7} fontSize="11" textAnchor="middle">
          놀람
        </text>
        <text x={centerX - radius * 0.7} y={centerY + radius * 0.7} fontSize="11" textAnchor="middle">
          슬픔
        </text>
        <text x={centerX + radius * 0.7} y={centerY + radius * 0.7} fontSize="11" textAnchor="middle">
          분노
        </text>

        {/* 점 */}
        <circle cx={x} cy={y} r={8} fill="#DC5F53" />
      </svg>

      <div className="mt-2 text-xs text-gray-500 text-center">
        감정 위치 (valence, arousal)
        <br />※ 중앙에 가까울수록 감정 강도가 약함
      </div>
    </div>
  );
}
