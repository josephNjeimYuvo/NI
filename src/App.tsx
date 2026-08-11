import { AppShell } from '@/components/shell/AppShell'
import { LoginScreen } from '@/components/login/LoginScreen'
import { AppStateProvider, useAppState } from '@/state/AppStateProvider'

/** Chooses between the sign-in screen and the application. */
function Root() {
  const { session } = useAppState()
  return session.authenticated ? <AppShell /> : <LoginScreen />
}

export function App() {
  return (
    <AppStateProvider>
      <Root />
    </AppStateProvider>
  )
}
