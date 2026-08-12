import { AppShell } from '@/components/shell/AppShell'
import { BootSplash } from '@/components/boot/BootSplash'
import { LoginScreen } from '@/components/login/LoginScreen'
import { AppStateProvider, useAppState } from '@/state/AppStateProvider'

/**
 * Sign-in, then the boot splash while the workspace warms up, then the app.
 *
 * The splash covers every authenticated state that is not yet ready, so the
 * shell can never appear for a frame before its data has landed.
 */
function Root() {
  const { session, boot } = useAppState()

  if (!session.authenticated) return <LoginScreen />
  if (boot.phase !== 'ready') return <BootSplash progress={boot.progress} />
  return <AppShell />
}

export function App() {
  return (
    <AppStateProvider>
      <Root />
    </AppStateProvider>
  )
}
