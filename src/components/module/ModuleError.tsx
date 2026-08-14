import { useEffect, useState } from 'react'
import { ModuleFailureMark } from '@/components/common/Marks'
import { MODULE_ICONS } from '@/data/catalog'
import { applicationOfModule, siblingModules } from '@/lib/catalog'
import { DuoIcon, Icon } from '@/lib/icons'
import { useAppState } from '@/state/AppStateProvider'
import type { ModuleFailure, ModuleFailureKind, Tab } from '@/types'
import './ModuleView.css'

/** Most alternative modules offered, so the row stays scannable. */
const ALTERNATIVE_LIMIT = 3

/**
 * Retry cooldown after `n` consecutive failures, in ms.
 *
 * The first retry is free — a timeout often clears on its own and making
 * someone wait to find that out is just friction. From the second failure
 * the wait grows, because hammering a service that has already refused twice
 * helps nobody, and a button that silently fails identically three times in
 * a row is worse than no button.
 */
function cooldownFor(failedAttempts: number): number {
  if (failedAttempts < 2) return 0
  return Math.min(30, 5 * (failedAttempts - 1)) * 1000
}

/** What the primary button on the failure screen does. */
type PrimaryAction = 'request-access' | 'retry' | 'report'

/**
 * Wording and the one action that follows from it, per failure kind.
 *
 * A module that is not provisioned, a service that timed out and a module
 * that crashed on the way up are three different events, and the difference
 * is not decoration: only one of them is worth retrying. Keeping copy and
 * action in one table makes that pairing visible in a single place, rather
 * than spread across the branches that render it.
 */
const COPY: Record<
  ModuleFailureKind,
  {
    status: string
    /** Neutral for something that has not shipped; critical for a fault. */
    tone: 'pending' | 'critical'
    title: (name: string) => string
    body: (app: string) => string
    action: PrimaryAction
  }
> = {
  unavailable: {
    status: 'Not available yet',
    tone: 'pending',
    title: (name) => `${name} isn't available yet`,
    body: (app) =>
      `This module is still in preview and hasn't been enabled for your tenant, so it won't open ` +
      `on this account. Nothing else is affected — the rest of ${app} is working normally.`,
    action: 'request-access',
  },
  timeout: {
    status: 'Service timed out',
    tone: 'critical',
    title: (name) => `${name} couldn't be loaded`,
    body: () =>
      `The analytics service didn't respond in time. Your session is still active and every other ` +
      `module is unaffected, so this is worth another try.`,
    action: 'retry',
  },
  internal: {
    status: 'Internal error',
    tone: 'critical',
    title: (name) => `${name} failed to start`,
    body: (app) =>
      `The module answered with an internal error, so it stopped before it could open. This one is ` +
      `on us, not on anything you did, and it has already been logged. Retrying won't clear it — ` +
      `the rest of ${app} is unaffected in the meantime.`,
    action: 'report',
  },
}

/** Used when a tab reached the error state without a described cause. */
const UNDESCRIBED: ModuleFailure = {
  kind: 'timeout',
  code: 'NI-GATEWAY-504',
  correlationId: 'unavailable',
  at: 0,
}

/** Badge and status-pill glyph per kind. */
const STATUS_ICONS: Record<ModuleFailureKind, string> = {
  unavailable: 'clock',
  timeout: 'alert',
  internal: 'x',
}

/**
 * Failure screen for a module that did not open.
 *
 * What it offers follows the kind of failure. A timeout gets Retry, backing
 * off once it has already been tried. An unprovisioned module gets a request
 * for access, and one that crashed on the way up gets its diagnostics handed
 * to the service desk — retrying either would fail in exactly the same way.
 * All three get somewhere else to go, since a dead end that only offers the
 * way back is still a dead end.
 */
export function ModuleError({ tab }: { tab: Tab }) {
  const { catalog, workspace, tabs, toast, goHome, openModule } = useAppState()

  const failure = tab.failure ?? UNDESCRIBED
  const copy = COPY[failure.kind]

  const application = applicationOfModule(catalog, tab.id)
  const icon = MODULE_ICONS[tab.id] ?? application.icon
  const alternatives = siblingModules(catalog, tab.id, ALTERNATIVE_LIMIT)

  const [handled, setHandled] = useState(false)
  const cooldown = useCooldown(failure.at + cooldownFor(tab.failedAttempts))

  const diagnostics = [
    `Module: ${tab.label}`,
    `Application: ${application.label}`,
    `Error code: ${failure.code}`,
    `Correlation ID: ${failure.correlationId}`,
    `Observed: ${new Date(failure.at).toISOString()}`,
  ].join('\n')

  const requestAccess = () => {
    setHandled(true)
    toast.show(`Access requested for ${tab.label}`)
  }

  // Reporting hands over the diagnostics as well as raising it, so the
  // details are already on the clipboard when the service desk asks.
  const report = () => {
    setHandled(true)
    workspace.copyToClipboard(diagnostics)
    toast.show(`Reported — diagnostics copied, quote ${failure.code}`)
  }

  return (
    <div className="ni-error">
      <div className="ni-error__body">
        <ModuleFailureMark icon={icon} kind={failure.kind} />

        <div
          className={`ni-error__status${copy.tone === 'pending' ? ' ni-error__status--pending' : ''}`}
        >
          <Icon name={STATUS_ICONS[failure.kind]} size={13} />
          {copy.status}
        </div>

        <h2 className="ni-error__title">{copy.title(tab.label)}</h2>
        <p className="ni-error__text">{copy.body(application.short ?? application.label)}</p>

        <div className="ni-error__actions">
          {copy.action === 'retry' && (
            <button
              type="button"
              className="ni-button-primary"
              onClick={() => tabs.openTab(tab.id)}
              disabled={cooldown > 0}
            >
              <Icon name="refresh" size={15} />
              {cooldown > 0 ? `Retry in ${cooldown}s` : 'Retry'}
            </button>
          )}
          {copy.action === 'request-access' && (
            <button
              type="button"
              className="ni-button-primary"
              onClick={requestAccess}
              disabled={handled}
            >
              <Icon name={handled ? 'check' : 'shield'} size={15} />
              {handled ? 'Request sent' : 'Request access'}
            </button>
          )}
          {copy.action === 'report' && (
            <button
              type="button"
              className="ni-button-primary"
              onClick={report}
              disabled={handled}
            >
              <Icon name={handled ? 'check' : 'share'} size={15} />
              {handled ? 'Reported' : 'Report to service desk'}
            </button>
          )}
          <button type="button" className="ni-button-secondary" onClick={goHome}>
            <Icon name="grid" size={15} />
            Back to Main menu
          </button>
        </div>

        {copy.action === 'retry' && tab.failedAttempts > 1 && (
          <div className="ni-error__attempts">
            Failed {tab.failedAttempts} times in a row. If the next attempt fails too, raise it with
            the service desk rather than retrying again.
          </div>
        )}

        {alternatives.length > 0 && (
          <div className="ni-error__alternatives">
            <span className="ni-error__alternativesLabel">Available now in {application.short ?? application.label}</span>
            <div className="ni-error__chips">
              {alternatives.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="ni-error__chip"
                  onClick={() => openModule(name)}
                >
                  <DuoIcon name={MODULE_ICONS[name] ?? application.icon} size={15} />
                  {name}
                  <span className="ni-error__chipArrow">
                    <Icon name="arrowR" size={13} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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
            <DetailRow icon="alert" label="Error code" value={failure.code} />
            <DetailRow icon="share" label="Correlation ID" value={failure.correlationId} />
            <DetailRow icon="file" label="Module" value={tab.label} />
            {failure.at > 0 && (
              <DetailRow
                icon="clock"
                label="Observed"
                value={new Date(failure.at).toLocaleTimeString()}
              />
            )}
            {/* One paste rather than four: support asks for the module and
                the time as well as the code, and reading them off screen is
                where transcription errors come from. */}
            <button
              type="button"
              className="ni-error__copy"
              onClick={() => workspace.copyToClipboard(diagnostics)}
            >
              <Icon name={workspace.copied ? 'check' : 'copy'} size={13} />
              {workspace.copied ? 'Copied' : 'Copy diagnostics'}
            </button>
          </div>
        )}

        <div className="ni-error__support">
          <Icon name="help" size={14} />
          <span>
            Still stuck? Call the service desk on <strong>x4400</strong> or raise a ticket in
            ServiceNow.
          </span>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="ni-error__detailRow">
      <span className="ni-error__detailLabel">
        <Icon name={icon} size={13} />
        {label}
      </span>
      <span className="ni-error__detailValue">{value}</span>
    </div>
  )
}

/**
 * Whole seconds left until `until`, counting down to zero.
 *
 * Driven by a deadline rather than a running total because the screen
 * unmounts while the module is retrying: the remaining time has to be
 * recoverable from the failure itself when it comes back.
 */
function useCooldown(until: number): number {
  const remaining = () => Math.max(0, Math.ceil((until - Date.now()) / 1000))
  const [seconds, setSeconds] = useState(remaining)

  useEffect(() => {
    setSeconds(remaining())
    if (until <= Date.now()) return

    const timer = setInterval(() => {
      const left = remaining()
      setSeconds(left)
      if (left <= 0) clearInterval(timer)
    }, 250)
    return () => clearInterval(timer)
  }, [until])

  return seconds
}
