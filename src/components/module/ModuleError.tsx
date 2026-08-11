import { BrokenMark } from '@/components/common/Marks'
import { Icon } from '@/lib/icons'
import { useAppState } from '@/state/AppStateProvider'
import './ModuleView.css'

/** Gateway error surfaced when a module fails to come up. */
const ERROR_CODE = 'NI-GATEWAY-504'

/**
 * Failure screen for a module that did not load.
 *
 * The correlation ID is derived from the module name so it stays stable
 * across retries of the same module — support can quote one ID for a
 * recurring failure rather than a new one each attempt.
 */
export function ModuleError({ moduleName }: { moduleName: string }) {
  const { workspace, tabs, goHome } = useAppState()
  const correlationId = `a41f-7c02-9db3-${moduleName.length}8e`

  return (
    <div className="ni-error">
      <div className="ni-error__body">
        <BrokenMark />

        <div className="ni-error__title">This module couldn&apos;t be loaded</div>
        <div className="ni-error__text">
          The analytics service didn&apos;t respond in time. Your session is still active — retry,
          or go back to the main menu and open it again.
        </div>

        <button
          type="button"
          className="ni-error__disclose"
          onClick={workspace.toggleDetails}
          aria-expanded={workspace.detailsOpen}
        >
          <span
            className={`ni-error__chevron${workspace.detailsOpen ? ' ni-error__chevron--open' : ''}`}
          >
            <Icon name="chevD" size={15} />
          </span>
          Technical details
        </button>

        {workspace.detailsOpen && (
          <div className="ni-error__details">
            <div className="ni-error__detailRow">
              <span>Error code</span>
              <span>{ERROR_CODE}</span>
            </div>
            <div className="ni-error__detailRow">
              <span>Correlation ID</span>
              <span>{correlationId}</span>
            </div>
            <button
              type="button"
              className="ni-error__copy"
              onClick={() => workspace.copyCorrelationId(correlationId)}
            >
              <Icon name="copy" size={13} />
              {workspace.copied ? 'Copied' : 'Copy correlation ID'}
            </button>
          </div>
        )}

        <div className="ni-error__actions">
          <button
            type="button"
            className="ni-button-primary"
            onClick={() => tabs.openTab(moduleName)}
          >
            Retry
          </button>
          <button type="button" className="ni-button-secondary" onClick={goHome}>
            Back to Main menu
          </button>
        </div>
      </div>
    </div>
  )
}
