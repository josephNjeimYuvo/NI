import { useState, type FormEvent } from 'react'
import { Icon } from '@/lib/icons'
import { LogoLockup } from '@/lib/logo'
import { BUILD_INFO, DEMO_CREDENTIALS } from '@/data/session'
import { useAppState } from '@/state/AppStateProvider'
import { useMeshRig } from '@/state/useMeshRig'
import { NetworkMesh } from './NetworkMesh'
import './LoginScreen.css'

/**
 * Sign-in screen.
 *
 * Credentials are local to this component — they never need to outlive the
 * form — while the resulting session goes through the app's auth service.
 */
export function LoginScreen() {
  const { preferences, session, signIn } = useAppState()
  const mesh = useMeshRig(true)

  const [email, setEmail] = useState(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password)
  const [revealPassword, setRevealPassword] = useState(false)
  const [remember, setRemember] = useState(true)

  const failed = session.error !== null
  const emailInvalid = failed && !email.trim()
  const passwordInvalid = failed && !password.trim()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void signIn({ email, password })
  }

  const clearError = () => {
    if (failed) session.clearError()
  }

  return (
    <div
      className="ni-login"
      style={{ cursor: mesh.cursor }}
      onPointerDown={mesh.onPointerDown}
      onWheel={mesh.onWheel}
      onDoubleClick={mesh.onDoubleClick}
    >
      <div className="ni-login__mesh">
        <NetworkMesh rig={mesh.rig} brand={preferences.brand} />
      </div>
      <div className="ni-login__wash" />

      <div className="ni-login__layout">
        <div className="ni-login__intro">
          <div className="ni-login__brand">
            <LogoLockup width={200} />
          </div>

          <div style={{ maxWidth: 440 }}>
            <div className="ni-login__headline">One platform. Every part of the network.</div>
            <div className="ni-login__sub">
              Plan, integrate, monitor and automate without leaving the surface you started in.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span className="ni-login__copyright">© 2026 Network Insight Platform</span>
          </div>
        </div>

        <div className="ni-login__cardColumn ni-scroll-hidden">
          <form className="ni-login__card" onSubmit={submit}>
            <div className="ni-login__cardEdge" />

            <div>
              <div className="ni-login__title">Sign in</div>
              <div className="ni-login__hint">Use your corporate account to continue.</div>
            </div>

            <div className="ni-login__form">
              <div className="ni-login__field">
                <label className="ni-login__label" htmlFor="ni-email">
                  Email
                </label>
                <input
                  id="ni-email"
                  className={`ni-login__input${emailInvalid ? ' ni-login__input--invalid' : ''}`}
                  type="email"
                  value={email}
                  placeholder="you@operator.com"
                  onChange={(event) => {
                    setEmail(event.target.value)
                    clearError()
                  }}
                />
              </div>

              <div className="ni-login__field">
                <label className="ni-login__label" htmlFor="ni-password">
                  Password
                </label>
                <div className="ni-login__password">
                  <input
                    id="ni-password"
                    className={`ni-login__input${passwordInvalid ? ' ni-login__input--invalid' : ''}`}
                    type={revealPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="••••••••"
                    onChange={(event) => {
                      setPassword(event.target.value)
                      clearError()
                    }}
                  />
                  <button
                    type="button"
                    className="ni-login__reveal"
                    title={revealPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setRevealPassword((current) => !current)}
                  >
                    <Icon name={revealPassword ? 'eyeOff' : 'eye'} size={17} />
                  </button>
                </div>
              </div>

              {failed && (
                <div className="ni-login__error" role="alert">
                  <Icon name="alert" size={17} />
                  <span>{session.error}</span>
                </div>
              )}

              <div className="ni-login__options">
                <button
                  type="button"
                  className="ni-login__remember"
                  onClick={() => setRemember((current) => !current)}
                  aria-pressed={remember}
                >
                  <span
                    className={`ni-login__checkbox${remember ? ' ni-login__checkbox--on' : ''}`}
                  >
                    {remember && <Icon name="check" size={11} />}
                  </span>
                  Remember me
                </button>
                <a className="ni-login__forgot" href="#forgot">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="ni-login__submit">
                Sign in
              </button>

              <div className="ni-login__divider">OR</div>

              <button type="submit" className="ni-login__sso">
                <Icon name="shield" size={16} />
                Continue with SSO
              </button>
            </div>

            <div className="ni-login__build">{BUILD_INFO}</div>
          </form>
        </div>
      </div>
    </div>
  )
}
