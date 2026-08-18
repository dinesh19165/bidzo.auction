import React from 'react';

function pointsFromData(data: { name: string; value: number }[], width = 300, height = 60) {
  if (!data.length) {
    return [] as Array<[number, number]>;
  }

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const len = data.length;
  return data.map((d, i) => {
    const x = len === 1 ? width / 2 : (i / (len - 1)) * width;
    const y = height - ((d.value - min) / (max - min || 1)) * height;
    return [x, y] as [number, number];
  });
}

export function SalesChart({
  width = 300,
  height = 60,
  data = [{ name: 'Revenue', value: 0 }],
}: {
  width?: number;
  height?: number;
  data?: Array<{ name: string; value: number }>;
}) {
  const pts = pointsFromData(data, width, height);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d || 'M 0 60 L 300 60'} fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d ? `${d} L ${width} ${height} L 0 ${height} Z` : `M 0 ${height} L ${width} ${height} L 0 ${height} Z`} fill="url(#g)" opacity={0.8} />
    </svg>
  );
}

export default SalesChart;
