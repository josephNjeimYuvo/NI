import { Icon } from '@/lib/icons'
import '@/components/panels/Panels.css'

/** Transient confirmation, centred at the bottom of the viewport. */
export function Toast({ message }: { message: string }) {
  return (
    <div className="ni-toast" role="status">
      <span style={{ color: 'var(--pri)', display: 'flex' }}>
        <Icon name="pin" size={14} />
      </span>
      <span className="ni-toast__text">{message}</span>
    </div>
  )
}
