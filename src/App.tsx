import { AppShell } from '@/components/shell/AppShell'
import { LoginScreen } from '@/components/login/LoginScreen'
import { SessionSplash } from '@/components/session/SessionSplash'
import { AppStateProvider, useAppState } from '@/state/AppStateProvider'

/**
 * The four states a session moves through: sign-in, the warm-up splash, the
 * app, and the teardown splash on the way back out.
 *
 * Order matters here. `leaving` is checked first because the teardown clears
 * the session partway through, and without that guard the login screen would
 * appear mid-splash. The `ready` check then covers every other authenticated
 * state, so the shell can never appear before its data has landed.
 */
function Root() {
  const { session, transition } = useAppState()

  if (transition.phase === 'leaving') {
    return <SessionSplash direction="out" progress={transition.progress} />
  }
  if (!session.authenticated) return <LoginScreen />
  if (transition.phase !== 'ready') {
    return <SessionSplash direction="in" progress={transition.progress} />
  }
  return <AppShell />
}

export function App() {
  return (
    <AppStateProvider>
      <Root />
    </AppStateProvider>
  )
}
