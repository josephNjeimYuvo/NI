import { useState } from 'react'
import { EmptyGridMark } from '@/components/common/Marks'
import {
  Popover,
  PopoverDivider,
  PopoverHeading,
  PopoverItem,
} from '@/components/common/Popover'
import { AUDIT_COLUMNS, PAGE_SIZE } from '@/data/moduleData'
import { Icon } from '@/lib/icons'
import { relativeTime } from '@/lib/format'
import { useAppState } from '@/state/AppStateProvider'
import type { AuditRow, GridLevel, KpiTone } from '@/types'
import { TrendWidget } from './TrendWidget'
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

/** Serialises the current page as CSV, quoting every field. */
function toCsv(rows: AuditRow[]): string {
  const header = AUDIT_COLUMNS.map((column) => column.label)
  const body = rows.map(cellsOf)
  return [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

/**
 * A loaded module: filter bar, KPI row with a trend, and the parameter grid.
 *
 * Every module renders this same workspace — the prototype models one
 * analytics surface rather than a distinct screen per module.
 */
export function ModuleWorkspace({ moduleName }: { moduleName: string }) {
  const { workspace, navigation, tabs, toast } = useAppState()
  const { rows, kpis, managedObject, totalItems, totalPages, updatedAt } = workspace.data

  const [sitesOpen, setSitesOpen] = useState(false)
  const [metricOpen, setMetricOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)

  const empty = rows.length === 0
  const selectedCount = workspace.selectedSites.length
  const firstRow = workspace.page * PAGE_SIZE + 1
  const lastRow = workspace.page * PAGE_SIZE + rows.length

  const share = () => {
    const link = `${window.location.origin}${window.location.pathname}?module=${encodeURIComponent(moduleName)}`
    workspace.copyToClipboard(link)
    toast.show('Link copied to clipboard')
  }

  const exportCsv = () => {
    setOptionsOpen(false)
    if (empty) {
      toast.show('Nothing to export — select one or more sites first')
      return
    }
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${moduleName.replace(/\s+/g, '-').toLowerCase()}-page-${workspace.page + 1}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.show(`Exported ${rows.length} rows`)
  }

  const gridActions = [
    {
      label: navigation.fullscreen ? 'Exit full screen' : 'Full screen',
      icon: navigation.fullscreen ? 'collapseFs' : 'expand',
      onClick: navigation.toggleFullscreen,
    },
    { label: 'Copy link to this module', icon: 'share', onClick: share },
    {
      label: 'Open in new window',
      icon: 'external',
      onClick: () => window.open(window.location.href, '_blank', 'noopener'),
    },
    { label: 'Refresh', icon: 'refresh', onClick: workspace.refresh },
    { label: 'Close module', icon: 'x', onClick: () => tabs.closeTab(moduleName) },
  ]

  return (
    <div className="ni-module">
      <div className="ni-filters">
        <div className="ni-chip">
          <span className="ni-chip__key">Date</span>
          <span className="ni-chip__value">Daily (Yesterday)</span>
        </div>

        <div className="ni-chip-anchor">
          <button
            type="button"
            className={`ni-chip ni-chip--button${selectedCount > 0 ? ' ni-chip--active' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={sitesOpen}
            onClick={() => setSitesOpen((open) => !open)}
          >
            <span className="ni-chip__key">Sites</span>
            <span className="ni-chip__value">
              {selectedCount === 0
                ? 'No selection'
                : selectedCount === workspace.sites.length
                  ? 'All sites'
                  : `${selectedCount} selected`}
            </span>
            <Icon name="chevD" size={15} />
          </button>

          <Popover
            open={sitesOpen}
            onClose={() => setSitesOpen(false)}
            label="Select sites"
            width={272}
          >
            <div className="ni-popover__actions">
              <button type="button" className="ni-popover__action" onClick={workspace.selectAllSites}>
                Select all
              </button>
              <button type="button" className="ni-popover__action" onClick={workspace.clearSites}>
                Clear
              </button>
            </div>
            {workspace.sites.map((site) => {
              const on = workspace.selectedSites.includes(site.id)
              return (
                <button
                  key={site.id}
                  type="button"
                  className="ni-popover__item"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => workspace.toggleSite(site.id)}
                >
                  <span className={`ni-popover__check${on ? ' ni-popover__check--on' : ''}`}>
                    {on && <Icon name="check" size={11} />}
                  </span>
                  <span className="ni-popover__itemText">
                    <span>
                      {site.id} · {site.name}
                    </span>
                    <span className="ni-popover__itemMeta">{site.region}</span>
                  </span>
                </button>
              )
            })}
          </Popover>
        </div>

        <div className="ni-chip ni-chip--radios" role="radiogroup" aria-label="Aggregation level">
          <span className="ni-chip__key">Level</span>
          {LEVELS.map((level) => {
            const on = workspace.level === level
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={on}
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

        <div className="ni-chip-anchor">
          <button
            type="button"
            className="ni-chip ni-chip--button"
            aria-haspopup="dialog"
            aria-expanded={metricOpen}
            onClick={() => setMetricOpen((open) => !open)}
          >
            <span className="ni-chip__key">Metric</span>
            <span className="ni-chip__value">{workspace.metric}</span>
            <Icon name="chevD" size={15} />
          </button>

          <Popover
            open={metricOpen}
            onClose={() => setMetricOpen(false)}
            label="Select metric"
            width={240}
          >
            {workspace.metrics.map((metric) => (
              <PopoverItem
                key={metric}
                selected={metric === workspace.metric}
                onClick={() => {
                  workspace.setMetric(metric)
                  setMetricOpen(false)
                }}
              >
                {metric}
              </PopoverItem>
            ))}
          </Popover>
        </div>

        <div className="ni-chip">
          <span className="ni-chip__key">Managed Object</span>
          <span className="ni-chip__value">{managedObject}</span>
        </div>

        <div className="ni-filters__actions">
          {gridActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="ni-gridAction"
              title={action.label}
              aria-label={action.label}
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
          <TrendWidget />
        </div>

        <section className="ni-grid" aria-label={`${moduleName} results`}>
          <div className="ni-grid__head">
            <h2 className="ni-grid__title">{moduleName} Grid</h2>
            {updatedAt > 0 && (
              <span className="ni-grid__stamp">Updated {relativeTime(updatedAt)}</span>
            )}
            <div className="ni-spacer" />

            <div className="ni-chip-anchor">
              <button
                type="button"
                className="ni-grid__headButton"
                title="Grid options"
                aria-label="Grid options"
                aria-haspopup="menu"
                aria-expanded={optionsOpen}
                onClick={() => setOptionsOpen((open) => !open)}
              >
                <Icon name="more" size={13} />
              </button>

              <Popover
                open={optionsOpen}
                onClose={() => setOptionsOpen(false)}
                align="right"
                label="Grid options"
                width={220}
              >
                <PopoverHeading>Grid</PopoverHeading>
                <PopoverItem
                  onClick={() => {
                    setOptionsOpen(false)
                    workspace.refresh()
                  }}
                >
                  <Icon name="refresh" size={15} />
                  Refresh data
                </PopoverItem>
                <PopoverItem onClick={exportCsv}>
                  <Icon name="file" size={15} />
                  Export page as CSV
                </PopoverItem>
                <PopoverDivider />
                <PopoverItem
                  onClick={() => {
                    setOptionsOpen(false)
                    workspace.clearSites()
                  }}
                >
                  <Icon name="x" size={15} />
                  Clear filters
                </PopoverItem>
              </Popover>
            </div>

            <button
              type="button"
              className="ni-grid__headButton"
              title={navigation.fullscreen ? 'Exit full screen' : 'Full screen'}
              aria-label={navigation.fullscreen ? 'Exit full screen' : 'Full screen'}
              onClick={navigation.toggleFullscreen}
            >
              <Icon name="expand" size={14} />
            </button>
          </div>

          <div className="ni-grid__scroll">
            <table className="ni-grid__table">
              <thead>
                <tr>
                  {AUDIT_COLUMNS.map((column) => {
                    const sorted = workspace.sort?.column === column.key
                    const direction = sorted ? workspace.sort!.direction : null
                    return (
                      <th
                        key={column.key}
                        aria-sort={
                          direction === 'asc'
                            ? 'ascending'
                            : direction === 'desc'
                              ? 'descending'
                              : 'none'
                        }
                      >
                        <button
                          type="button"
                          className={`ni-grid__sort${sorted ? ' ni-grid__sort--on' : ''}`}
                          onClick={() => workspace.toggleSort(column.key)}
                          title={`Sort by ${column.label}`}
                        >
                          {column.label}
                          <span
                            className={`ni-grid__sortMark${
                              direction === 'desc' ? ' ni-grid__sortMark--desc' : ''
                            }`}
                          >
                            <Icon name={sorted ? 'chevD' : 'eq'} size={13} />
                          </span>
                        </button>
                      </th>
                    )
                  })}
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
                  onClick={() => setSitesOpen(true)}
                >
                  Select sites
                </button>
              </div>
            )}
          </div>

          <div className="ni-grid__footer">
            <div className="ni-pager">
              <button
                type="button"
                className="ni-pager__button"
                aria-label="Previous page"
                disabled={workspace.page === 0}
                onClick={() => workspace.setPage(workspace.page - 1)}
              >
                ‹
              </button>
              <span className="ni-pager__current">{workspace.page + 1}</span>
              <button
                type="button"
                className="ni-pager__button"
                aria-label="Next page"
                disabled={workspace.page + 1 >= totalPages}
                onClick={() => workspace.setPage(workspace.page + 1)}
              >
                ›
              </button>
              {totalPages > 1 && <span className="ni-pager__total">of {totalPages}</span>}
            </div>
            <div className="ni-spacer" />
            <span aria-live="polite">
              {empty
                ? 'No items to display'
                : `${firstRow}–${lastRow} of ${totalItems.toLocaleString('en-US')} items`}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
