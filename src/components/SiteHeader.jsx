import { Link, NavLink } from 'react-router-dom'
import { useAppAuth, isClerkConfigured } from '../auth/AuthContext'
import { canManageListings, canModerateListings, ROLE_LABELS, ROLES } from '../auth/roles'
import { ClerkAuthControls } from './ClerkAuthControls'

export function SiteHeader({ savedCount = 0, pendingCount = 0 }) {
  const auth = useAppAuth()
  const clerk = isClerkConfigured()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" to="/">
          <span className="brand__mark">NVN</span>
          <span className="brand__name">Estate</span>
        </Link>

        <nav className="site-header__actions" aria-label="Primary">
          <NavLink className="site-header__link" to="/sell">
            Sell your home
          </NavLink>
          {auth.isSignedIn && auth.role === ROLES.BUYER ? (
            <NavLink className="site-header__link" to="/saved">
              My saved homes
            </NavLink>
          ) : null}
          {auth.isSignedIn && canManageListings(auth.role) ? (
            <NavLink className="site-header__link" to="/submit-listing">
              Submit listing
            </NavLink>
          ) : null}
          {auth.isSignedIn && canModerateListings(auth.role) ? (
            <NavLink className="site-header__link" to="/admin">
              Admin review{pendingCount ? ` (${pendingCount})` : ''}
            </NavLink>
          ) : null}
          <Link className="site-header__link" to="/#mortgage">
            Mortgage calc
          </Link>

          {auth.isSignedIn ? (
            <p className="site-header__note">
              {ROLE_LABELS[auth.role] || 'Signed in'}
              {auth.role === ROLES.BUYER ? ` · ${savedCount} saved` : ''}
            </p>
          ) : (
            <p className="site-header__note">{savedCount} saved locally</p>
          )}

          {clerk ? (
            <ClerkAuthControls />
          ) : auth.isSignedIn ? (
            <button type="button" className="auth-chip" onClick={auth.signOut}>
              Sign out
            </button>
          ) : (
            <>
              <button
                type="button"
                className="auth-chip"
                onClick={() => auth.signInAs(ROLES.BUYER)}
              >
                Demo buyer
              </button>
              <button
                type="button"
                className="auth-chip"
                onClick={() => auth.signInAs(ROLES.AGENT)}
              >
                Demo agent
              </button>
              <button
                type="button"
                className="auth-chip auth-chip--solid"
                onClick={() => auth.signInAs(ROLES.ADMIN)}
              >
                Demo admin
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
