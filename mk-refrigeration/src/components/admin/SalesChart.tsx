'use client'

import { useState } from 'react'

interface MonthData {
  month: string   // "Jan 25"
  total: number
}

function compact(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function full(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function SalesChart({ data }: { data: MonthData[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 640
  const H = 220
  const PAD = { top: 24, right: 16, bottom: 36, left: 56 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const max = Math.max(...data.map((d) => d.total), 1)
  const gridSteps = 4
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) =>
    Math.round((max / gridSteps) * i)
  )

  const barCount = data.length
  const slotW = plotW / barCount
  const barW = Math.min(24, slotW * 0.55)
  const radius = 4

  const yScale = (v: number) => PAD.top + plotH - (v / max) * plotH

  const maxIdx = data.reduce((mi, d, i) => (d.total > data[mi].total ? i : mi), 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-on-surface-variant text-sm">
        No sales data yet.
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ userSelect: 'none' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ overflow: 'visible' }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid lines */}
        {gridValues.map((v) => {
          const y = yScale(v)
          return (
            <g key={v}>
              <line
                x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y}
                stroke="currentColor" strokeWidth={1}
                className="text-outline-variant/30"
              />
              <text
                x={PAD.left - 6} y={y}
                textAnchor="end" dominantBaseline="middle"
                fontSize={10} className="fill-on-surface-variant"
              >
                {compact(v)}
              </text>
            </g>
          )
        })}

        {/* Baseline */}
        <line
          x1={PAD.left} y1={PAD.top + plotH}
          x2={PAD.left + plotW} y2={PAD.top + plotH}
          stroke="currentColor" strokeWidth={1.5}
          className="text-outline-variant/50"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const cx = PAD.left + slotW * i + slotW / 2
          const barH = Math.max((d.total / max) * plotH, d.total > 0 ? 4 : 0)
          const y = PAD.top + plotH - barH
          const isHov = hovered === i
          const isMax = i === maxIdx && d.total > 0

          return (
            <g key={i}>
              {/* Hit target */}
              <rect
                x={cx - slotW / 2} y={PAD.top}
                width={slotW} height={plotH}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
                style={{ cursor: 'default' }}
              />

              {/* Bar */}
              <rect
                x={cx - barW / 2}
                y={y}
                width={barW}
                height={barH}
                rx={barH > radius ? radius : 0}
                ry={barH > radius ? radius : 0}
                fill={isHov ? '#1e40af' : isMax ? '#1565C0' : '#60A5FA'}
                style={{ transition: 'fill .12s' }}
                clipPath={`url(#top-round-${i})`}
              />

              {/* Clip path: round top only */}
              <defs>
                <clipPath id={`top-round-${i}`}>
                  <rect
                    x={cx - barW / 2 - 1}
                    y={y}
                    width={barW + 2}
                    height={barH}
                    rx={radius} ry={radius}
                  />
                </clipPath>
              </defs>

              {/* Direct label — only on max bar */}
              {isMax && d.total > 0 && (
                <text
                  x={cx} y={y - 5}
                  textAnchor="middle" fontSize={9}
                  fontWeight={700}
                  className="fill-on-surface"
                >
                  {compact(d.total)}
                </text>
              )}

              {/* X axis label */}
              <text
                x={cx} y={PAD.top + plotH + 16}
                textAnchor="middle" fontSize={10}
                className={`${isHov ? 'fill-on-surface font-bold' : 'fill-on-surface-variant'}`}
              >
                {d.month}
              </text>
            </g>
          )
        })}

        {/* Tooltip */}
        {hovered !== null && (() => {
          const d = data[hovered]
          const cx = PAD.left + slotW * hovered + slotW / 2
          const tipW = 110
          const tipH = 40
          const tipX = Math.min(Math.max(cx - tipW / 2, 0), W - tipW)
          const barH = Math.max((d.total / max) * plotH, 4)
          const tipY = PAD.top + plotH - barH - tipH - 8

          return (
            <g>
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={6} fill="white"
                filter="drop-shadow(0 2px 6px rgba(0,0,0,.15))" />
              <text x={tipX + tipW / 2} y={tipY + 14} textAnchor="middle" fontSize={10}
                className="fill-on-surface-variant">{d.month}</text>
              <text x={tipX + tipW / 2} y={tipY + 30} textAnchor="middle" fontSize={12}
                fontWeight={700} className="fill-on-surface">{full(d.total)}</text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
