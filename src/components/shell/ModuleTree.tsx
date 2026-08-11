import { Icon, IconBold } from '@/lib/icons'
import type { NavigationVendor } from '@/types'
import { useAppState } from '@/state/AppStateProvider'

/**
 * Shared building blocks for the module tree, used by both the expanded
 * sidebar and the rail flyout.
 */

interface LeafProps {
  name: string
  /** Flyout leaves swap the bullet for an icon and sit slightly taller. */
  variant?: 'sidebar' | 'flyout'
}

/** An openable module. Highlights when it is the active tab. */
export function ModuleLeaf({ name, variant = 'sidebar' }: LeafProps) {
  const { tabs, openModule } = useAppState()
  const active = tabs.activeTabId === name

  return (
    <button
      type="button"
      className={[
        'ni-leaf',
        variant === 'flyout' ? 'ni-leaf--flyout' : '',
        active ? 'ni-leaf--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => openModule(name)}
    >
      {variant === 'flyout' ? (
        <span className="ni-leaf__icon">
          <IconBold name="react" size={14} />
        </span>
      ) : (
        <span className="ni-leaf__dot" />
      )}
      <span className="ni-leaf__label">{name}</span>
    </button>
  )
}

interface VendorGroupProps {
  /** Application id, namespacing the vendor key so names can repeat. */
  scope: string
  vendor: NavigationVendor
  variant?: 'sidebar' | 'flyout'
}

/**
 * A vendor and its modules. Vendors start open, so the navigation state
 * tracks the ones explicitly closed.
 */
export function VendorGroup({ scope, vendor, variant = 'sidebar' }: VendorGroupProps) {
  const { navigation } = useAppState()
  const key = `${scope}/${vendor.name}`
  const open = !navigation.closedVendors[key]

  return (
    <div className={variant === 'flyout' ? 'ni-flyout__vendor' : 'ni-vendor'}>
      <button
        type="button"
        className="ni-vendor__button"
        onClick={() => navigation.toggleVendor(key)}
        aria-expanded={open}
      >
        <span className="ni-vendor__initial">{vendor.name.charAt(0)}</span>
        <span className="ni-vendor__name">{vendor.name}</span>
        <span className={`ni-vendor__chevron${open ? ' ni-vendor__chevron--open' : ''}`}>
          <Icon name="chevD" size={13} />
        </span>
      </button>

      {open && (
        <div className={variant === 'flyout' ? 'ni-flyout__vendorItems' : 'ni-vendor__items'}>
          {vendor.items.map((item) => (
            <ModuleLeaf key={item} name={item} variant={variant} />
          ))}
        </div>
      )}
    </div>
  )
}
