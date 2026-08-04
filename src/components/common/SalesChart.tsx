import React from 'react';
import { chartSeries } from '../../data/mockData';

function pointsFromData(data: { name: string; value: number }[], width = 300, height = 60) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const len = data.length;
  return data.map((d, i) => {
    const x = (i / (len - 1)) * width;
    const y = height - ((d.value - min) / (max - min || 1)) * height;
    return [x, y];
  });
}

export function SalesChart({ width = 300, height = 60 }: { width?: number; height?: number }) {
  const pts = pointsFromData(chartSeries as any, width, height);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill="url(#g)" opacity={0.8} />
    </svg>
  );
}

export default SalesChart;
