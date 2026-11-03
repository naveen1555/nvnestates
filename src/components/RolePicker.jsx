import { ROLE_LABELS, ROLES } from '../auth/roles'
import { useAppAuth } from '../auth/AuthContext'

export function RolePicker() {
  const { needsRole, setRole, fullName } = useAppAuth()

  if (!needsRole) return null

  return (
    <div className="role-picker" role="dialog" aria-modal="true" aria-labelledby="role-picker-title">
      <div className="role-picker__panel">
        <p className="eyebrow">Welcome{fullName ? `, ${fullName}` : ''}</p>
        <h2 id="role-picker-title">How will you use NVN Estate?</h2>
        <p className="role-picker__copy">
          Choose a role to unlock the right tools. Buyers save homes, agents submit listings, and
          admins approve what goes public.
        </p>
        <div className="role-picker__actions role-picker__actions--three">
          <button type="button" className="role-card" onClick={() => setRole(ROLES.BUYER)}>
            <strong>{ROLE_LABELS[ROLES.BUYER]}</strong>
            <span>Save favorites, browse history, and set filter alerts.</span>
          </button>
          <button type="button" className="role-card" onClick={() => setRole(ROLES.AGENT)}>
            <strong>{ROLE_LABELS[ROLES.AGENT]}</strong>
            <span>Submit listings for admin review and capture seller leads.</span>
          </button>
          <button type="button" className="role-card" onClick={() => setRole(ROLES.ADMIN)}>
            <strong>{ROLE_LABELS[ROLES.ADMIN]}</strong>
            <span>Review submissions, approve for publishing, or delete listings.</span>
          </button>
        </div>
      </div>
    </div>
  )
}
