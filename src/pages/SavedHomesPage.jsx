import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAppAuth } from '../auth/AuthContext'
import { ROLES } from '../auth/roles'
import { formatPrice } from '../lib/format'
import { deleteFilterAlert, getFilterAlerts, getViewHistory } from '../db/userData'
import { PropertyCard } from '../components/PropertyCard'

export function SavedHomesPage({
  listings,
  favoriteIds,
  onToggleFavorite,
  onViewDetails,
  onSaveAlert,
  currentFilters,
}) {
  const auth = useAppAuth()
  const [alerts, setAlerts] = useState(() => getFilterAlerts(auth.userId))
  const [, setHistoryTick] = useState(0)
  const history = getViewHistory(auth.userId)

  const savedHomes = useMemo(
    () => listings.filter((property) => favoriteIds.includes(property.id)),
    [favoriteIds, listings],
  )

  function openDetails(property) {
    onViewDetails(property)
    setHistoryTick((tick) => tick + 1)
  }

  if (!auth.isSignedIn) {
    return (
      <main className="page page--narrow">
        <p className="eyebrow">Buyer dashboard</p>
        <h1>My saved homes</h1>
        <p className="page-copy">Sign in as a buyer to sync favorites, history, and filter alerts.</p>
        <Link className="listing-form__primary" to="/">
          Back to listings
        </Link>
      </main>
    )
  }

  if (auth.role && auth.role !== ROLES.BUYER) {
    return (
      <main className="page page--narrow">
        <p className="eyebrow">Buyer dashboard</p>
        <h1>My saved homes</h1>
        <p className="page-copy">This dashboard is for buyer accounts. Switch role or browse listings.</p>
        <Link className="listing-form__primary" to="/">
          Browse homes
        </Link>
      </main>
    )
  }

  function handleDeleteAlert(alertId) {
    setAlerts(deleteFilterAlert(auth.userId, alertId))
  }

  function handleSaveCurrentFilters() {
    if (!currentFilters) return
    const next = onSaveAlert({
      name: currentFilters.location?.trim() || 'Saved search',
      location: currentFilters.location || '',
      minPrice: currentFilters.minPrice,
      maxPrice: currentFilters.maxPrice,
      types: currentFilters.types || [],
      bedrooms: currentFilters.bedrooms || [],
    })
    setAlerts(next)
  }

  return (
    <main className="page">
      <div className="page__intro">
        <div>
          <p className="eyebrow">Buyer dashboard</p>
          <h1>My saved homes</h1>
          <p className="page-copy">
            Favorites, recent views, and filter alerts for {auth.fullName || 'your account'}.
          </p>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2>Favorited listings</h2>
          <span>{savedHomes.length}</span>
        </div>
        {savedHomes.length === 0 ? (
          <div className="empty">
            <p className="empty__title">No favorites yet</p>
            <p>Tap the heart on a listing to keep it here.</p>
            <Link className="listing-form__primary" to="/">
              Find homes
            </Link>
          </div>
        ) : (
          <div className="grid dashboard-grid">
            {savedHomes.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                saved
                active={false}
                cardRef={null}
                onActivate={() => {}}
                onToggleFavorite={onToggleFavorite}
                onViewDetails={openDetails}
              />
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2>Saved filter alerts</h2>
          <button type="button" className="auth-chip" onClick={handleSaveCurrentFilters}>
            Save current filters
          </button>
        </div>
        {alerts.length === 0 ? (
          <div className="empty">
            <p className="empty__title">No alerts yet</p>
            <p>Save a search from the home filters to get a reusable alert card here.</p>
          </div>
        ) : (
          <ul className="alert-list">
            {alerts.map((alert) => (
              <li key={alert.id} className="alert-card">
                <div>
                  <strong>{alert.name}</strong>
                  <p>
                    {alert.location || 'Any location'} · {formatPrice(alert.minPrice)} –{' '}
                    {formatPrice(alert.maxPrice)}
                  </p>
                  <p>
                    {(alert.types || []).join(', ') || 'Any type'}
                    {(alert.bedrooms || []).length
                      ? ` · ${alert.bedrooms.map((b) => (b === 3 ? '3+' : b)).join(', ')} BHK`
                      : ''}
                  </p>
                </div>
                <button type="button" className="auth-chip" onClick={() => handleDeleteAlert(alert.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2>View history</h2>
          <span>{history.length}</span>
        </div>
        {history.length === 0 ? (
          <div className="empty">
            <p className="empty__title">No recent views</p>
            <p>Open a property’s details and it will appear in your history.</p>
          </div>
        ) : (
          <ul className="history-list">
            {history.map((entry) => (
              <li key={`${entry.id}-${entry.viewedAt}`}>
                <img src={entry.image} alt="" />
                <div>
                  <strong>{entry.title}</strong>
                  <p>
                    {formatPrice(entry.price)} · {entry.location}
                  </p>
                  <p className="history-list__meta">
                    Viewed {new Date(entry.viewedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
