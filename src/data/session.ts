import type { Session, User } from '@/types'

const MINUTE = 60_000
const HOUR = 3_600_000

export const DEFAULT_USER: User = {
  name: 'Joseph Morel',
  email: 'joseph.morel@ni-telecom.com',
}

/**
 * Credentials the sign-in form starts pre-filled with. A real deployment would
 * drop these and start empty.
 */
export const DEMO_CREDENTIALS = {
  email: 'joseph.morel@ni-telecom.com',
  password: 'network-insight',
}

export const DEFAULT_FAVORITES: string[] = [
  'Active Alarms',
  'RAN 4G Dashboard (New)',
  'Input Builder - ERC',
  'NOK LTE NI CM Dump',
  'KPI Scorecard',
]

/**
 * Seed history. Timestamps are relative to load so the "x ago" labels stay
 * sensible however long the fixture sits in the repo.
 */
export function buildDefaultSession(now: number = Date.now()): Session {
  return {
    user: DEFAULT_USER,
    favorites: [...DEFAULT_FAVORITES],
    recent: [
      { name: 'LTE Performance Optimization', timestamp: now - 22 * MINUTE },
      { name: 'Active Alarms', timestamp: now - 2 * HOUR },
      { name: 'Core KPI Browser', timestamp: now - 6 * HOUR },
      { name: 'Coverage Map', timestamp: now - 27 * HOUR },
      { name: 'Threshold System Settings', timestamp: now - 2 * 24 * HOUR },
      { name: 'Job Scheduler', timestamp: now - 4 * 24 * HOUR },
    ],
  }
}

/** Product version shown on the sign-in card. */
export const BUILD_INFO = 'Network Insight 7.4.2 · build 20260810'
