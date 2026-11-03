import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import { canModerateListings, ROLES } from '../auth/roles'
import { formatPrice, formatSqft } from '../lib/format'
import { LISTING_STATUS, isPendingListing, statusLabel } from '../lib/listings'

export function AdminPage({
  listings,
  onApprove,
  onReject,
  onDelete,
  onViewDetails,
}) {
  const auth = useAppAuth()
  const [tab, setTab] = useState('pending')

  const pending = useMemo(() => listings.filter(isPendingListing), [listings])
  const rejected = useMemo(
    () => listings.filter((item) => item.status === LISTING_STATUS.REJECTED),
    [listings],
  )
  const approved = useMemo(
    () => listings.filter((item) => (item.status || LISTING_STATUS.APPROVED) === LISTING_STATUS.APPROVED),
    [listings],
  )

  const visible =
    tab === 'pending' ? pending : tab === 'rejected' ? rejected : tab === 'approved' ? approved : listings

  if (!auth.isSignedIn) {
    return (
      <main className="page page--narrow">
        <p className="eyebrow">Admin</p>
        <h1>Listing review</h1>
        <p className="page-copy">Sign in as an admin to approve or delete listings.</p>
        {auth.mode === 'demo' ? (
          <button
            type="button"
            className="listing-form__primary"
            onClick={() => auth.signInAs(ROLES.ADMIN)}
          >
            Continue as demo admin
          </button>
        ) : (
          <Link className="listing-form__primary" to="/">
            Sign in from the header
          </Link>
        )}
      </main>
    )
  }

  if (!canModerateListings(auth.role)) {
    return (
      <main className="page page--narrow">
        <p className="eyebrow">Admin</p>
        <h1>Admin access required</h1>
        <p className="page-copy">Only Admin accounts can review and publish listings.</p>
        <Link className="listing-form__primary" to="/">
          Back to listings
        </Link>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="page__intro">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Listing review</h1>
          <p className="page-copy">
            Approve listings to publish them on the public grid, or delete anything that shouldn’t stay
            live.
          </p>
        </div>
      </div>

      <div className="view-tabs" role="tablist" aria-label="Admin listing filters">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'pending'}
          className={tab === 'pending' ? 'view-tab is-active' : 'view-tab'}
          onClick={() => setTab('pending')}
        >
          Pending
          <span>{pending.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'approved'}
          className={tab === 'approved' ? 'view-tab is-active' : 'view-tab'}
          onClick={() => setTab('approved')}
        >
          Approved
          <span>{approved.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'rejected'}
          className={tab === 'rejected' ? 'view-tab is-active' : 'view-tab'}
          onClick={() => setTab('rejected')}
        >
          Rejected
          <span>{rejected.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          className={tab === 'all' ? 'view-tab is-active' : 'view-tab'}
          onClick={() => setTab('all')}
        >
          All
          <span>{listings.length}</span>
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p className="empty__title">Nothing in this queue</p>
          <p>
            {tab === 'pending'
              ? 'New agent submissions will appear here for review.'
              : 'No listings match this filter.'}
          </p>
        </div>
      ) : (
        <ul className="admin-list">
          {visible.map((property) => (
            <li key={property.id} className="admin-card">
              <img src={property.image} alt="" className="admin-card__media" />
              <div className="admin-card__body">
                <div className="admin-card__top">
                  <div>
                    <p className={`status-pill status-pill--${property.status || 'approved'}`}>
                      {statusLabel(property.status || LISTING_STATUS.APPROVED)}
                    </p>
                    <h2>{property.title}</h2>
                    <p>
                      {formatPrice(property.price)} · {property.location}
                    </p>
                    <p className="admin-card__meta">
                      {property.type}
                      {property.bhk ? ` · ${property.bhk} BHK` : ''}
                      {property.sqft ? ` · ${formatSqft(property.sqft)}` : ''}
                      {property.submittedAt
                        ? ` · submitted ${new Date(property.submittedAt).toLocaleString('en-IN')}`
                        : ''}
                    </p>
                  </div>
                </div>
                <p className="admin-card__description">{property.description}</p>
                <div className="admin-card__actions">
                  <button
                    type="button"
                    className="auth-chip"
                    onClick={() => onViewDetails(property)}
                  >
                    Preview
                  </button>
                  {property.status !== LISTING_STATUS.APPROVED ? (
                    <button
                      type="button"
                      className="listing-form__primary"
                      onClick={() => onApprove(property.id)}
                    >
                      Approve & publish
                    </button>
                  ) : null}
                  {property.status !== LISTING_STATUS.REJECTED ? (
                    <button
                      type="button"
                      className="listing-form__secondary"
                      onClick={() => onReject(property.id)}
                    >
                      Reject
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="admin-card__danger"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete “${property.title}”? This removes it from the catalog permanently.`,
                        )
                      ) {
                        onDelete(property.id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
