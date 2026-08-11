import { useCallback, useEffect, useState } from 'react'
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
}

/** The notification inbox and its slide-over panel. */
export function useNotifications(): NotificationsState {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [filter, setFilter] = useState<NotificationFilter>('All')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    void services.notifications.list().then((loaded) => {
      if (active) setNotifications(loaded)
    })
    return () => {
      active = false
    }
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
  }
}
