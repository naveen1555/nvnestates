import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { properties as seedProperties } from './data/properties'
import { useAppAuth } from './auth/AuthContext'
import { canManageListings } from './auth/roles'
import { SiteHeader } from './components/SiteHeader'
import { RolePicker } from './components/RolePicker'
import { PropertyDetail } from './components/PropertyDetail'
import { HomePage } from './pages/HomePage'
import { SavedHomesPage } from './pages/SavedHomesPage'
import { SellHomePage } from './pages/SellHomePage'
import { SubmitListingPage } from './pages/SubmitListingPage'
import { AdminPage } from './pages/AdminPage'
import { createDefaultFilters } from './lib/filters'
import { LISTING_STATUS, isApprovedListing, normalizeListing } from './lib/listings'
import {
  deleteListingFromCatalog,
  getAgentListings,
  getFavorites,
  getListingCatalog,
  recordView,
  removeAgentListingEverywhere,
  saveAgentListing,
  saveFilterAlert,
  saveListingCatalog,
  setFavorites,
  toggleFavoriteId,
  upsertListingInCatalog,
} from './db/userData'

const GUEST_KEY = 'guest'
const LEGACY_FAVORITES_KEY = 'nvnestate-favorites'

function readLegacyFavorites() {
  try {
    const raw = localStorage.getItem(LEGACY_FAVORITES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function storageKeyFor(auth) {
  return auth.isSignedIn && auth.userId ? auth.userId : GUEST_KEY
}

function buildInitialListings(auth) {
  const seeded = seedProperties.map((property) => normalizeListing(property))
  const catalog = getListingCatalog().map((property) => normalizeListing(property))
  const byId = new Map(seeded.map((property) => [property.id, property]))

  for (const property of catalog) {
    byId.set(property.id, property)
  }

  if (auth.isSignedIn && auth.userId) {
    for (const property of getAgentListings(auth.userId)) {
      if (!byId.has(property.id)) {
        byId.set(property.id, normalizeListing(property))
      }
    }
  }

  const merged = [...byId.values()]
  saveListingCatalog(merged)
  return merged
}

export default function App() {
  const auth = useAppAuth()
  const userKey = storageKeyFor(auth)

  const [listings, setListings] = useState(() => buildInitialListings(auth))
  const [favoriteIds, setFavoriteIds] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [filters, setFilters] = useState(() => createDefaultFilters(seedProperties))

  const approvedListings = useMemo(() => listings.filter(isApprovedListing), [listings])

  useEffect(() => {
    if (!auth.isSignedIn || !auth.userId) return
    const stored = getAgentListings(auth.userId)
    if (!stored.length) return
    setListings((current) => {
      const missing = stored
        .map(normalizeListing)
        .filter((item) => !current.some((listing) => listing.id === item.id))
      if (!missing.length) return current
      const next = [...missing, ...current]
      saveListingCatalog(next)
      return next
    })
  }, [auth.isSignedIn, auth.userId])

  useEffect(() => {
    const stored = getFavorites(userKey)
    if (stored.length === 0 && userKey === GUEST_KEY) {
      const legacy = readLegacyFavorites()
      if (legacy.length) {
        setFavorites(GUEST_KEY, legacy)
        setFavoriteIds(legacy)
        return
      }
    }
    setFavoriteIds(stored)
  }, [userKey])

  const selected = useMemo(
    () => listings.find((property) => property.id === selectedId) ?? null,
    [listings, selectedId],
  )

  const persistListings = useCallback((updater) => {
    setListings((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      saveListingCatalog(next)
      return next
    })
  }, [])

  const toggleFavorite = useCallback(
    (id) => {
      const next = toggleFavoriteId(userKey, id)
      setFavoriteIds(next)
      if (userKey === GUEST_KEY) {
        localStorage.setItem(LEGACY_FAVORITES_KEY, JSON.stringify(next))
      }
    },
    [userKey],
  )

  const closeDetail = useCallback(() => setSelectedId(null), [])

  const handleViewDetails = useCallback(
    (property) => {
      setSelectedId(property.id)
      if (auth.isSignedIn) {
        recordView(auth.userId, property)
      }
    },
    [auth.isSignedIn, auth.userId],
  )

  const handleSubmitListing = useCallback(
    (property) => {
      const pending = normalizeListing({
        ...property,
        status: LISTING_STATUS.PENDING,
      })
      persistListings((current) => [pending, ...current])
      setFilters((current) => ({
        ...current,
        minPrice: Math.min(current.minPrice, pending.price),
        maxPrice: Math.max(current.maxPrice, pending.price),
      }))
      if (auth.userId && canManageListings(auth.role)) {
        saveAgentListing(auth.userId, pending)
      }
      upsertListingInCatalog(pending)
      setSelectedId(null)
    },
    [auth.role, auth.userId, persistListings],
  )

  const handleApprove = useCallback(
    (id) => {
      persistListings((current) =>
        current.map((property) =>
          property.id === id
            ? {
                ...property,
                status: LISTING_STATUS.APPROVED,
                reviewedAt: new Date().toISOString(),
                reviewedBy: auth.userId,
              }
            : property,
        ),
      )
    },
    [auth.userId, persistListings],
  )

  const handleReject = useCallback(
    (id) => {
      persistListings((current) =>
        current.map((property) =>
          property.id === id
            ? {
                ...property,
                status: LISTING_STATUS.REJECTED,
                reviewedAt: new Date().toISOString(),
                reviewedBy: auth.userId,
              }
            : property,
        ),
      )
    },
    [auth.userId, persistListings],
  )

  const handleDelete = useCallback(
    (id) => {
      persistListings((current) => current.filter((property) => property.id !== id))
      deleteListingFromCatalog(id)
      removeAgentListingEverywhere(id)
      setFavoriteIds((current) => {
        const next = current.filter((item) => item !== id)
        setFavorites(userKey, next)
        if (userKey === GUEST_KEY) {
          localStorage.setItem(LEGACY_FAVORITES_KEY, JSON.stringify(next))
        }
        return next
      })
      setSelectedId((current) => (current === id ? null : current))
    },
    [persistListings, userKey],
  )

  const handleSaveAlert = useCallback(
    (alert) => {
      if (!auth.userId) return []
      return saveFilterAlert(auth.userId, alert)
    },
    [auth.userId],
  )

  const pendingCount = useMemo(
    () => listings.filter((property) => property.status === LISTING_STATUS.PENDING).length,
    [listings],
  )

  return (
    <>
      <SiteHeader savedCount={favoriteIds.length} pendingCount={pendingCount} />
      <RolePicker />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              listings={approvedListings}
              favoriteIds={favoriteIds}
              filters={filters}
              onFiltersChange={setFilters}
              onToggleFavorite={toggleFavorite}
              onViewDetails={handleViewDetails}
              selectedPrice={selected?.price ?? null}
            />
          }
        />
        <Route
          path="/saved"
          element={
            <SavedHomesPage
              listings={approvedListings}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              onViewDetails={handleViewDetails}
              onSaveAlert={handleSaveAlert}
              currentFilters={filters}
            />
          }
        />
        <Route path="/sell" element={<SellHomePage listings={approvedListings} />} />
        <Route
          path="/submit-listing"
          element={<SubmitListingPage onSubmitListing={handleSubmitListing} />}
        />
        <Route
          path="/admin"
          element={
            <AdminPage
              listings={listings}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {selected ? (
        <PropertyDetail
          property={selected}
          saved={favoriteIds.includes(selected.id)}
          onClose={closeDetail}
          onToggleFavorite={toggleFavorite}
        />
      ) : null}
    </>
  )
}
