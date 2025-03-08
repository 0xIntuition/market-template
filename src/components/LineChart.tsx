'use client'

import { useMemo } from 'react'

interface Point {
  x: number
  y: number
}

interface LineChartProps {
  points: Point[]
  specialPoint: Point
  width?: number
  height?: number
  xAxisLabel?: string
  yAxisLabel?: string
}

export function LineChart({
  points,
  specialPoint = { x: 0, y: 0 }, // = { x: 5, y: 5 },
  width = 256,
  height = 256,
  xAxisLabel = 'SHARES',
  yAxisLabel = 'PRICE',
}: LineChartProps) {
  const padding = 20
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Calculate scales
  const xScale = useMemo(() => {
    const xMin = Math.min(...points.map((p) => p.x))
    const xMax = Math.max(...points.map((p) => p.x))
    return (x: number) => ((x - xMin) / (xMax - xMin)) * chartWidth + padding
  }, [points, chartWidth])

  const yScale = useMemo(() => {
    const yMin = Math.min(...points.map((p) => p.y))
    const yMax = Math.max(...points.map((p) => p.y))
    return (y: number) => height - (((y - yMin) / (yMax - yMin)) * chartHeight + padding)
  }, [points, chartHeight, height])

  // Generate the path string
  const pathData = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${xScale(point.x)} ${yScale(point.y)}`).join(' ')

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* X-axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="white"
          strokeWidth="1"
          className="opacity-50"
        />

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="white"
          strokeWidth="1"
          className="opacity-50"
        />

        {/* X-axis label */}
        <text x={width / 2} y={height - 5} textAnchor="middle" fill="white" fontSize="14" className="opacity-70">
          {xAxisLabel}
        </text>

        {/* Y-axis label */}
        <text
          x={5}
          y={height / 2}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          transform={`rotate(-90, 5, ${height / 2})`}
          className="opacity-70"
        >
          {yAxisLabel}
        </text>

        {/* Line */}
        <path d={pathData} stroke="white" strokeWidth="2" fill="none" className="opacity-50" />

        {/* Points */}
        {points.map((point, i) => (
          <circle key={i} cx={xScale(point.x)} cy={yScale(point.y)} r="3" fill="white" className="opacity-50" />
        ))}

        {/* Special Point */}
        {points.length > 0 && specialPoint && (
          <circle cx={xScale(specialPoint.x)} cy={yScale(specialPoint.y)} r="6" fill="#FFFFFF" className="opacity-80" />
        )}
      </svg>
    </div>
  )
}
