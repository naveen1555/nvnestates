import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import { canManageListings, ROLES } from '../auth/roles'
import { MortgageCalculator } from '../components/MortgageCalculator'
import { PropertyGrid } from '../components/PropertyGrid'
import { PropertyMap } from '../components/PropertyMap'
import { SearchFilterBar } from '../components/SearchFilterBar'
import {
  createDefaultFilters,
  filterProperties,
  getPriceBounds,
  hasActiveFilters,
} from '../lib/filters'

export function HomePage({
  listings,
  favoriteIds,
  filters,
  onFiltersChange,
  onToggleFavorite,
  onViewDetails,
  selectedPrice,
}) {
  const auth = useAppAuth()
  const [view, setView] = useState('all')
  const [activeId, setActiveId] = useState(null)
  const [focusSource, setFocusSource] = useState(null)

  const priceBounds = useMemo(() => getPriceBounds(listings), [listings])
  const filtered = useMemo(() => filterProperties(listings, filters), [filters, listings])

  const visible = useMemo(() => {
    if (view === 'saved') {
      return filtered.filter((property) => favoriteIds.includes(property.id))
    }
    return filtered
  }, [favoriteIds, filtered, view])

  const filtersActive = hasActiveFilters(filters, priceBounds)

  useEffect(() => {
    if (activeId && !visible.some((property) => property.id === activeId)) {
      setActiveId(null)
      setFocusSource(null)
    }
  }, [activeId, visible])

  const emptyCopy =
    view === 'saved' && favoriteIds.length === 0
      ? {
          title: 'No saved homes yet',
          body: 'Tap the heart on a listing and it will stay in this list on this device.',
        }
      : {
          title: 'No homes match these filters',
          body: 'Try a different location, widen the price range, or clear one of the type and bedroom chips.',
        }

  const highlightFromList = useCallback((id) => {
    setActiveId(id)
    setFocusSource('hover')
  }, [])

  const activateFromList = useCallback((id) => {
    setActiveId(id)
    setFocusSource('list')
  }, [])

  const activateFromMap = useCallback((id) => {
    setActiveId(id)
    setFocusSource('map')
  }, [])

  return (
    <main id="listings" className="page">
      <div className="page__intro">
        <div>
          <p className="eyebrow">Homes for sale</p>
          <h1>Places with room to live.</h1>
        </div>
        <div className="view-tabs" role="tablist" aria-label="Listing filter">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'all'}
            className={view === 'all' ? 'view-tab is-active' : 'view-tab'}
            onClick={() => setView('all')}
          >
            All homes
            <span>{filtered.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'saved'}
            className={view === 'saved' ? 'view-tab is-active' : 'view-tab'}
            onClick={() => setView('saved')}
          >
            Saved
            <span>{favoriteIds.length}</span>
          </button>
        </div>
      </div>

      <SearchFilterBar
        filters={filters}
        bounds={priceBounds}
        resultCount={visible.length}
        onChange={onFiltersChange}
        onClear={() => onFiltersChange(createDefaultFilters(listings))}
        canClear={filtersActive}
      />

      <section className="split" aria-label="Map and property listings">
        <aside className="split__map">
          <PropertyMap
            properties={visible}
            activeId={activeId}
            focusSource={focusSource}
            onSelect={activateFromMap}
          />
        </aside>

        <div className="split__list">
          <PropertyGrid
            properties={visible}
            favoriteIds={favoriteIds}
            activeId={activeId}
            focusSource={focusSource}
            emptyTitle={emptyCopy.title}
            emptyBody={emptyCopy.body}
            onActivate={highlightFromList}
            onToggleFavorite={onToggleFavorite}
            onViewDetails={(property) => {
              activateFromList(property.id)
              onViewDetails(property)
            }}
          />
        </div>
      </section>

      {!canManageListings(auth.role) ? (
        <section className="agent-cta" aria-label="List a property">
          <div>
            <p className="eyebrow">Agents & sellers</p>
            <h2>Ready to list a home?</h2>
            <p>
              Sign in as an agent to post and edit listings, or start with a free valuation on Sell
              your home.
            </p>
          </div>
          <div className="agent-cta__actions">
            <Link className="listing-form__primary" to="/sell">
              Sell your home
            </Link>
            {auth.mode === 'demo' && !auth.isSignedIn ? (
              <button
                type="button"
                className="listing-form__secondary"
                onClick={() => auth.signInAs(ROLES.AGENT)}
              >
                Demo agent sign-in
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <MortgageCalculator seedPrice={selectedPrice} />
    </main>
  )
}
