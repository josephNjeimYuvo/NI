import { EmptyGridMark } from '@/components/common/Marks'
import { AUDIT_COLUMNS } from '@/data/moduleData'
import { Icon } from '@/lib/icons'
import { useAppState } from '@/state/AppStateProvider'
import type { AuditRow, GridLevel, KpiTone } from '@/types'
import './ModuleView.css'

const LEVELS: GridLevel[] = ['Cell', 'Site']

const TONE_CLASS: Record<KpiTone, string> = {
  positive: ' ni-kpi__delta--positive',
  warning: ' ni-kpi__delta--warning',
  neutral: '',
}

/** Column order matches {@link AUDIT_COLUMNS}. */
function cellsOf(row: AuditRow): string[] {
  return [row.date, row.site, row.neType, row.parameter, row.value, row.previousValue]
}

/**
 * A loaded module: filter bar, KPI row, and the parameter grid.
 *
 * Every module renders this same workspace — the prototype models one
 * analytics surface rather than a distinct screen per module.
 */
export function ModuleWorkspace({ moduleName }: { moduleName: string }) {
  const { workspace, navigation, tabs } = useAppState()
  const { rows, kpis, managedObject, totalItems } = workspace.data
  const empty = rows.length === 0

  const gridActions = [
    {
      label: navigation.fullscreen ? 'Exit full screen' : 'Full screen',
      icon: navigation.fullscreen ? 'collapseFs' : 'expand',
      onClick: navigation.toggleFullscreen,
    },
    { label: 'Share', icon: 'share', onClick: () => {} },
    { label: 'Open in new window', icon: 'external', onClick: () => {} },
    { label: 'Pivot view', icon: 'pivot', onClick: () => {} },
    { label: 'Refresh', icon: 'refresh', onClick: () => tabs.openTab(moduleName) },
    { label: 'Close module', icon: 'x', onClick: () => tabs.closeTab(moduleName) },
  ]

  return (
    <div className="ni-module">
      <div className="ni-filters">
        <div className="ni-chip">
          <span className="ni-chip__key">Date</span>
          <span className="ni-chip__value">Daily (Yesterday)</span>
        </div>

        <button
          type="button"
          className={`ni-chip ni-chip--button${
            workspace.sitesSelected ? ' ni-chip--active' : ''
          }`}
          onClick={workspace.toggleSites}
        >
          <span className="ni-chip__key">Sites</span>
          <span className="ni-chip__value">
            {workspace.sitesSelected ? '4 selected' : 'No selection'}
          </span>
          <Icon name="chevD" size={15} />
        </button>

        <div className="ni-chip ni-chip--radios">
          <span className="ni-chip__key">Level</span>
          {LEVELS.map((level) => {
            const on = workspace.level === level
            return (
              <button
                key={level}
                type="button"
                className={`ni-radio${on ? ' ni-radio--on' : ''}`}
                onClick={() => workspace.setLevel(level)}
              >
                <span className="ni-radio__ring">
                  <span className="ni-radio__dot" />
                </span>
                {level}
              </button>
            )
          })}
        </div>

        <div className="ni-chip">
          <span className="ni-chip__key">Managed Object</span>
          <span className="ni-chip__value">{managedObject}</span>
        </div>

        <div className="ni-spacer" />

        <div className="ni-filters__actions">
          {gridActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="ni-gridAction"
              title={action.label}
              onClick={action.onClick}
            >
              <Icon name={action.icon} size={17} />
            </button>
          ))}
        </div>
      </div>

      <div className="ni-module__body">
        <div className="ni-kpis">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="ni-kpi">
              <div className="ni-kpi__label">{kpi.label}</div>
              <div className="ni-kpi__value">{kpi.value}</div>
              <div className={`ni-kpi__delta${TONE_CLASS[kpi.tone]}`}>{kpi.delta}</div>
            </div>
          ))}

          {/* A deliberately degraded tile, showing partial failure in place. */}
          <div className="ni-kpi--failed">
            <span style={{ color: 'var(--crit)', display: 'flex', flexShrink: 0 }}>
              <Icon name="alert" size={17} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>
                Trend widget unavailable
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--mut)' }}>Metric service timed out.</div>
            </div>
            <button type="button" className="ni-kpi__retry">
              Retry
            </button>
          </div>
        </div>

        <div className="ni-grid">
          <div className="ni-grid__head">
            <span className="ni-grid__title">{moduleName} Grid</span>
            <div className="ni-spacer" />
            <button type="button" className="ni-grid__headButton" title="Grid options">
              <Icon name="more" size={13} />
            </button>
            <button
              type="button"
              className="ni-grid__headButton"
              title={navigation.fullscreen ? 'Exit full screen' : 'Full screen'}
              onClick={navigation.toggleFullscreen}
            >
              <Icon name="expand" size={14} />
            </button>
          </div>

          <div className="ni-grid__scroll">
            <table className="ni-grid__table">
              <thead>
                <tr>
                  {AUDIT_COLUMNS.map((column) => (
                    <th key={column}>
                      <span className="ni-grid__th">
                        {column}
                        <span className="ni-grid__thMenu">
                          <Icon name="more" size={13} />
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.site}-${row.parameter}`}>
                    {cellsOf(row).map((value, index) => (
                      <td key={index}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {empty && (
              <div className="ni-grid__empty">
                <EmptyGridMark />
                <div className="ni-grid__emptyTitle">No data found</div>
                <div className="ni-grid__emptyText">
                  Nothing matches the current filters. Select one or more sites to load results.
                </div>
                <button
                  type="button"
                  className="ni-grid__emptyAction"
                  onClick={workspace.toggleSites}
                >
                  Select sites
                </button>
              </div>
            )}
          </div>

          <div className="ni-grid__footer">
            <div className="ni-pager">
              <button type="button" className="ni-pager__button" aria-label="Previous page">
                ‹
              </button>
              <span className="ni-pager__current">1</span>
              <button type="button" className="ni-pager__button" aria-label="Next page">
                ›
              </button>
            </div>
            <div className="ni-spacer" />
            <span>
              {empty
                ? 'No items to display'
                : `${rows.length} of ${totalItems.toLocaleString('en-US')} items`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
