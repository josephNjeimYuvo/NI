import type { AppNotification } from '@/types'

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    severity: 'critical',
    title: 'Cell outage · LSB0421',
    body: 'Sector 2 down for 14 minutes. Auto-ticket INC-88214 raised.',
    time: '4m',
    read: false,
    category: 'Alarms',
  },
  {
    id: 2,
    severity: 'critical',
    title: 'Core CCPC threshold breach',
    body: 'Signalling load above 92% on MME cluster PT-2.',
    time: '18m',
    read: false,
    category: 'Alarms',
  },
  {
    id: 3,
    severity: 'warning',
    title: 'PRB utilisation rising',
    body: '11 LTE cells above 85% in Porto region.',
    time: '1h',
    read: false,
    category: 'Alarms',
  },
  {
    id: 4,
    severity: 'info',
    title: 'Daily RAN report ready',
    body: 'RAN 4G Dashboard export finished for 09 Aug.',
    time: '3h',
    read: true,
    category: 'Reports',
  },
  {
    id: 5,
    severity: 'info',
    title: 'Scheduled maintenance',
    body: 'Data Management loaders paused 02:00–03:00 UTC.',
    time: '9h',
    read: true,
    category: 'System',
  },
  {
    id: 6,
    severity: 'warning',
    title: 'Loader retry',
    body: 'ERI CM dump loader retried twice before succeeding.',
    time: '1d',
    read: true,
    category: 'System',
  },
]

/**
 * Which module a notification opens when actioned. Alarms jump straight to the
 * live alarm list; everything else lands in automation run history.
 */
export const NOTIFICATION_TARGETS: Record<string, string> = {
  Alarms: 'Active Alarms',
  System: 'Run History',
  Reports: 'Run History',
}
