import type { AuditRow, Kpi } from '@/types'

/** Sites available to the site picker. */
export const SITES: string[] = [
  'LSB0421 · Lisboa Centro',
  'PRT1180 · Porto Boavista',
  'FAR0093 · Faro Marina',
  'BRG0710 · Braga Norte',
]

/** Metrics offered by the metric picker. */
export const METRICS: string[] = [
  'RRC Setup Success Rate',
  'E-RAB Drop Rate',
  'DL Cell Throughput',
  'PRB Utilisation',
  'Handover Success Rate',
]

/** Parameter-audit rows returned once a site selection is committed. */
export const AUDIT_ROWS: AuditRow[] = [
  { date: '09 Aug 2026', site: 'LSB0421', neType: 'LTE', parameter: 'cellBarred', value: 'false', previousValue: 'true' },
  { date: '09 Aug 2026', site: 'LSB0421', neType: 'LTE', parameter: 'maxTxPower', value: '43.0', previousValue: '41.0' },
  { date: '09 Aug 2026', site: 'PRT1180', neType: 'LTE', parameter: 'qRxLevMin', value: '-124', previousValue: '-120' },
  { date: '09 Aug 2026', site: 'PRT1180', neType: 'NR', parameter: 'ssbFrequency', value: '632448', previousValue: '632448' },
  { date: '09 Aug 2026', site: 'FAR0093', neType: 'LTE', parameter: 'tac', value: '31402', previousValue: '31402' },
  { date: '09 Aug 2026', site: 'BRG0710', neType: 'UMTS', parameter: 'primaryScramblingCode', value: '271', previousValue: '264' },
]

/** Column headers for the audit grid, in display order. */
export const AUDIT_COLUMNS: string[] = [
  'Date',
  'Site',
  'NE Type',
  'Param Name',
  'Date Param Value',
  'Previous Date Param Value',
]

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

/** Total server-side row count, used for the grid footer. */
export const TOTAL_ITEMS = 1284

/** Managed object class in scope, by whether a selection exists. */
export const MANAGED_OBJECT = { selected: 'EUtranCellFDD', empty: 'NoData' }
