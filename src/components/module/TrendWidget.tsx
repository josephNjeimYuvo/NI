import { Icon } from '@/lib/icons'
import { useAppState } from '@/state/AppStateProvider'
import type { TrendSeries } from '@/types'
import './ModuleView.css'

/** Drawing box for the sparkline, in viewBox units. */
const CHART = { width: 220, height: 44, pad: 3 }

/**
 * Sparkline over the metric's range rather than zero, so a series that only
 * moves within a narrow band still shows its shape.
 */
function Sparkline({ series }: { series: TrendSeries }) {
  const values = series.points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const usableWidth = CHART.width - CHART.pad * 2
  const usableHeight = CHART.height - CHART.pad * 2

  const coords = values.map((value, i) => {
    const x = CHART.pad + (i / Math.max(1, values.length - 1)) * usableWidth
    const y = CHART.pad + (1 - (value - min) / span) * usableHeight
    return { x, y }
  })

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const area = `${line} L${coords.at(-1)!.x.toFixed(1)} ${CHART.height} L${coords[0]!.x.toFixed(1)} ${CHART.height} Z`
  const last = coords.at(-1)!

  return (
    <svg
      className="ni-trend__chart"
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ni-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--icon-accent)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--icon-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ni-trend-fill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--icon-accent)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r={2.4} fill="var(--icon-accent)" />
    </svg>
  )
}

/**
 * Metric trend beside the KPI tiles.
 *
 * It loads independently of the grid, so when the metric service is down the
 * rest of the workspace still works and only this piece offers a retry.
 */
export function TrendWidget() {
  const { workspace } = useAppState()

  if (workspace.trendStatus === 'failed') {
    return (
      <div className="ni-trend ni-trend--failed" role="group" aria-label="Trend unavailable">
        <span className="ni-trend__failIcon">
          <Icon name="alert" size={17} />
        </span>
        <div className="ni-trend__failText">
          <div className="ni-trend__failTitle">Trend widget unavailable</div>
          <div className="ni-trend__failBody">Metric service timed out.</div>
        </div>
        <button type="button" className="ni-kpi__retry" onClick={workspace.retryTrend}>
          Retry
        </button>
      </div>
    )
  }

  if (workspace.trendStatus === 'loading' || !workspace.trend) {
    return (
      <div className="ni-trend" role="group" aria-label="Loading trend">
        <div className="ni-trend__head">
          <span className="ni-skeleton ni-skeleton--label" />
        </div>
        <span className="ni-skeleton ni-skeleton--chart" />
      </div>
    )
  }

  const { trend } = workspace

  return (
    <div className="ni-trend" role="group" aria-label={`${trend.metric} trend`}>
      <div className="ni-trend__head">
        <span className="ni-trend__metric">{trend.metric}</span>
        <span className={`ni-trend__delta ni-trend__delta--${trend.tone}`}>{trend.delta}</span>
      </div>
      <Sparkline series={trend} />
    </div>
  )
}
