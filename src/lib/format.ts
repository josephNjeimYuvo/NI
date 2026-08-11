/**
 * Formats a timestamp as a coarse age: "Just now", "14m ago", "3h ago",
 * "Yesterday", "4d ago". Deliberately low-resolution — these labels sit in
 * dense lists where precision would only add noise.
 */
export function relativeTime(timestamp: number, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - timestamp) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  return days === 1 ? 'Yesterday' : `${days}d ago`
}
