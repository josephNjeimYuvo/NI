import type { AuditRow, Kpi, Site, TrendSeries } from '@/types'

/** Sites available to the site picker. */
export const SITES: Site[] = [
  { id: 'LSB0421', name: 'Lisboa Centro', region: 'Lisboa' },
  { id: 'LSB0588', name: 'Lisboa Oriente', region: 'Lisboa' },
  { id: 'PRT1180', name: 'Porto Boavista', region: 'Porto' },
  { id: 'PRT1204', name: 'Porto Campanhã', region: 'Porto' },
  { id: 'FAR0093', name: 'Faro Marina', region: 'Algarve' },
  { id: 'FAR0117', name: 'Faro Aeroporto', region: 'Algarve' },
  { id: 'BRG0710', name: 'Braga Norte', region: 'Norte' },
  { id: 'CBR0342', name: 'Coimbra Baixa', region: 'Centro' },
]

/** Metrics offered by the metric picker. */
export const METRICS: string[] = [
  'RRC Setup Success Rate',
  'E-RAB Drop Rate',
  'DL Cell Throughput',
  'PRB Utilisation',
  'Handover Success Rate',
]

/** Column headers for the audit grid, in display order. */
export const AUDIT_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'site', label: 'Site' },
  { key: 'neType', label: 'NE Type' },
  { key: 'parameter', label: 'Param Name' },
  { key: 'value', label: 'Date Param Value' },
  { key: 'previousValue', label: 'Previous Date Param Value' },
] as const

/** Parameters audited per network element type, with plausible value pairs. */
const PARAMETERS: Array<{ neType: string; name: string; values: [string, string][] }> = [
  {
    neType: 'LTE',
    name: 'cellBarred',
    values: [['false', 'true'], ['false', 'false'], ['true', 'false']],
  },
  {
    neType: 'LTE',
    name: 'maxTxPower',
    values: [['43.0', '41.0'], ['43.0', '43.0'], ['40.0', '43.0']],
  },
  {
    neType: 'LTE',
    name: 'qRxLevMin',
    values: [['-124', '-120'], ['-120', '-120'], ['-118', '-124']],
  },
  {
    neType: 'LTE',
    name: 'tac',
    values: [['31402', '31402'], ['31405', '31402']],
  },
  {
    neType: 'NR',
    name: 'ssbFrequency',
    values: [['632448', '632448'], ['636768', '632448']],
  },
  {
    neType: 'NR',
    name: 'ssbPeriodicity',
    values: [['20', '20'], ['10', '20']],
  },
  {
    neType: 'UMTS',
    name: 'primaryScramblingCode',
    values: [['271', '264'], ['264', '264'], ['288', '271']],
  },
  {
    neType: 'UMTS',
    name: 'maxDlPower',
    values: [['33.0', '33.0'], ['31.0', '33.0']],
  },
]

const AUDIT_DATE = '09 Aug 2026'

/**
 * The full audit dataset.
 *
 * Generated rather than hand-written so the grid has enough rows for paging
 * and sorting to mean something, and generated deterministically — no random
 * source — so a given row always carries the same values across reloads.
 */
export const AUDIT_ROWS: AuditRow[] = SITES.flatMap((site, siteIndex) =>
  PARAMETERS.flatMap((parameter, parameterIndex) =>
    parameter.values.map((pair, pairIndex): AuditRow => ({
      date: AUDIT_DATE,
      site: site.id,
      neType: parameter.neType,
      // Cells within a site are distinguished by an index suffix, which is
      // what makes each row unique at Cell level.
      parameter: `${parameter.name}[${siteIndex + parameterIndex + pairIndex}]`,
      value: pair[0],
      previousValue: pair[1],
    })),
  ),
)

/** KPI tiles once a selection exists. */
export const POPULATED_KPIS: Kpi[] = [
  { label: 'Cells reporting', value: '1,284', delta: '+18 vs yesterday', tone: 'positive' },
  { label: 'Parameter deltas', value: '46', delta: '6 flagged for review', tone: 'warning' },
  { label: 'Audit compliance', value: '97.2%', delta: '+0.4 pts', tone: 'positive' },
]

/** KPI tiles before any selection is made. */
export const EMPTY_KPIS: Kpi[] = POPULATED_KPIS.map((kpi) => ({
  label: kpi.label,
  value: '—',
  delta: 'awaiting filter',
  tone: 'neutral',
}))

/** Managed object class in scope, by whether a selection exists. */
export const MANAGED_OBJECT = { selected: 'EUtranCellFDD', empty: 'NoData' }

/** Rows shown per grid page. */
export const PAGE_SIZE = 12

/**
 * Modules whose trend widget fails to load.
 *
 * The prototype needs to show a partially-degraded workspace somewhere, but
 * showing it in every module reads as a broken product rather than a
 * demonstrated failure state — so it is scoped to two modules.
 */
export const FAILING_TREND_MODULES: string[] = ['Coverage Map', 'Alarm Correlation']

/** Deterministic sample series, keyed by metric. */
const TREND_SHAPES: Record<string, number[]> = {
  'RRC Setup Success Rate': [98.1, 98.4, 98.2, 98.7, 99.0, 98.8, 99.2],
  'E-RAB Drop Rate': [0.42, 0.39, 0.44, 0.37, 0.33, 0.35, 0.31],
  'DL Cell Throughput': [41.2, 43.8, 42.1, 45.6, 47.2, 46.4, 48.9],
  'PRB Utilisation': [61, 64, 68, 72, 78, 81, 85],
  'Handover Success Rate': [97.4, 97.6, 97.1, 97.9, 98.2, 98.0, 98.4],
}

const TREND_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Metrics where a rising line is bad news rather than good. */
const LOWER_IS_BETTER = new Set(['E-RAB Drop Rate', 'PRB Utilisation'])

export function buildTrend(metric: string): TrendSeries {
  const values = TREND_SHAPES[metric] ?? TREND_SHAPES['RRC Setup Success Rate']!
  const first = values[0]!
  const last = values[values.length - 1]!
  const change = last - first
  const rising = change >= 0

  return {
    metric,
    points: values.map((value, i) => ({ label: TREND_DAYS[i] ?? '', value })),
    delta: `${change >= 0 ? '+' : ''}${change.toFixed(change % 1 === 0 ? 0 : 1)} over 7 days`,
    // A climbing drop-rate or utilisation is a warning, not a win.
    tone: LOWER_IS_BETTER.has(metric) ? (rising ? 'warning' : 'positive') : rising ? 'positive' : 'warning',
  }
}
