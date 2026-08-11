import { DuoIcon, Icon } from '@/lib/icons'
import { applicationById } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import { ModuleLeaf, VendorGroup } from './ModuleTree'
import './Sidebar.css'

/** Most entries the Recently Used flyout lists. */
const RECENT_PREVIEW = 8

/**
 * The panel the collapsed rail opens.
 *
 * It shows either a pinned section (Favorites, Recent) or an application's
 * module tree, and can be pinned open — which expands the sidebar and leaves
 * the corresponding category open.
 */
export function RailFlyout() {
  const { catalog, navigation, session } = useAppState()
  const target = navigation.flyout
  if (!target) return null

  const isSection = target === 'favorites' || target === 'recent'
  const application = isSection ? null : applicationById(catalog, target)
  const nav = application ? (catalog.navigation[application.id] ?? { items: [] }) : { items: [] }

  const sectionNames =
    target === 'favorites'
      ? session.favorites
      : target === 'recent'
        ? session.recent.map((entry) => entry.name).slice(0, RECENT_PREVIEW)
        : []

  const title = isSection
    ? target === 'favorites'
      ? 'My Favorites'
      : 'Recently Used'
    : (application?.label ?? '')

  /** Pinning promotes the flyout into the expanded sidebar, opened to here. */
  const pin = () => {
    if (isSection) {
      navigation.openSection(target)
    } else if (application) {
      navigation.selectApp(application.id)
      navigation.openCategory(application.id)
    }
    navigation.expand()
  }

  return (
    <div>
      <div
        className="ni-flyout__scrim"
        onClick={navigation.closeFlyout}
        role="presentation"
      />
      <div className="ni-flyout" style={{ top: `${navigation.flyoutTop}px` }}>
        <div className="ni-flyout__header">
          <span className="ni-flyout__icon">
            {isSection ? (
              <Icon name={target === 'favorites' ? 'star' : 'clock'} size={15} />
            ) : (
              application && <DuoIcon name={application.icon} size={15} />
            )}
          </span>
          <span className="ni-flyout__title">{title}</span>
          <button
            type="button"
            className="ni-flyout__pin"
            title="Expand sidebar"
            onClick={pin}
          >
            <Icon name="pin" size={14} />
          </button>
        </div>

        <div className="ni-flyout__body">
          {(nav.vendors ?? []).map((vendor) => (
            <VendorGroup
              key={vendor.name}
              scope={application?.id ?? ''}
              vendor={vendor}
              variant="flyout"
            />
          ))}
          {(isSection ? sectionNames : nav.items).map((name) => (
            <ModuleLeaf key={name} name={name} variant="flyout" />
          ))}
        </div>
      </div>
    </div>
  )
}
