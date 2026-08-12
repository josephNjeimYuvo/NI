import { useCallback, useState } from 'react'
import { services } from '@/services'
import type { AppNotification, NotificationCategory } from '@/types'

/** Filter chips above the notification list. */
export type NotificationFilter = 'All' | NotificationCategory

export const NOTIFICATION_FILTERS: NotificationFilter[] = ['All', 'Alarms', 'System', 'Reports']

export interface NotificationsState {
  notifications: AppNotification[]
  /** Notifications matching the active filter. */
  visible: AppNotification[]
  unreadCount: number
  filter: NotificationFilter
  setFilter: (filter: NotificationFilter) => void
  open: boolean
  toggle: () => void
  close: () => void
  markAllRead: () => void
  dismiss: (id: number) => void
  /** Fetches the inbox. Driven by the boot sequence, after sign-in. */
  load: () => Promise<void>
  /** Drops everything, for sign-out. */
  clear: () => void
}

/**
 * The notification inbox and its slide-over panel.
 *
 * Loading is explicit rather than on mount: notifications are user data, so
 * nothing is fetched until there is a signed-in user to fetch them for.
 */
export function useNotifications(): NotificationsState {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [filter, setFilter] = useState<NotificationFilter>('All')
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    setNotifications(await services.notifications.list())
  }, [])

  const clear = useCallback(() => {
    setNotifications([])
    setFilter('All')
    setOpen(false)
  }, [])

  const toggle = useCallback(() => setOpen((current) => !current), [])
  const close = useCallback(() => setOpen(false), [])

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }, [])

  const dismiss = useCallback((id: number) => {
    setNotifications((current) => current.filter((item) => item.id !== id))
  }, [])

  const visible = notifications.filter(
    (item) => filter === 'All' || item.category === filter,
  )
  const unreadCount = notifications.filter((item) => !item.read).length

  return {
    notifications,
    visible,
    unreadCount,
    filter,
    setFilter,
    open,
    toggle,
    close,
    markAllRead,
    dismiss,
    load,
    clear,
  }
}
