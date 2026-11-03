import { dbRead, dbUpdate, dbWrite } from './store'

const EMPTY_FAVORITES = []
const EMPTY_HISTORY = []
const EMPTY_ALERTS = []
const EMPTY_LEADS = []

export function getFavorites(userId) {
  if (!userId) return []
  return dbRead('favorites', userId, EMPTY_FAVORITES)
}

export function setFavorites(userId, ids) {
  return dbWrite('favorites', userId, ids)
}

export function toggleFavoriteId(userId, propertyId) {
  return dbUpdate('favorites', userId, EMPTY_FAVORITES, (ids) =>
    ids.includes(propertyId) ? ids.filter((id) => id !== propertyId) : [...ids, propertyId],
  )
}

export function getViewHistory(userId) {
  if (!userId) return []
  return dbRead('history', userId, EMPTY_HISTORY)
}

export function recordView(userId, property) {
  if (!userId || !property) return []
  return dbUpdate('history', userId, EMPTY_HISTORY, (entries) => {
    const next = [
      {
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location,
        image: property.image,
        viewedAt: new Date().toISOString(),
      },
      ...entries.filter((entry) => entry.id !== property.id),
    ]
    return next.slice(0, 24)
  })
}

export function getFilterAlerts(userId) {
  if (!userId) return []
  return dbRead('alerts', userId, EMPTY_ALERTS)
}

export function saveFilterAlert(userId, alert) {
  return dbUpdate('alerts', userId, EMPTY_ALERTS, (alerts) => [
    {
      id: `alert-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      ...alert,
    },
    ...alerts,
  ])
}

export function deleteFilterAlert(userId, alertId) {
  return dbUpdate('alerts', userId, EMPTY_ALERTS, (alerts) =>
    alerts.filter((alert) => alert.id !== alertId),
  )
}

export function getLeads() {
  return dbRead('leads', 'global', EMPTY_LEADS)
}

export function createLead(lead) {
  const record = {
    id: `lead-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    status: 'new',
    ...lead,
  }
  dbUpdate('leads', 'global', EMPTY_LEADS, (leads) => [record, ...leads])
  return record
}

export function getAgentListings(userId) {
  if (!userId) return []
  return dbRead('agent-listings', userId, [])
}

export function saveAgentListing(userId, property) {
  return dbUpdate('agent-listings', userId, [], (listings) => {
    const exists = listings.some((item) => item.id === property.id)
    if (exists) {
      return listings.map((item) => (item.id === property.id ? property : item))
    }
    return [property, ...listings]
  })
}

export function removeAgentListingEverywhere(propertyId) {
  try {
    const prefix = 'nvnestate:db:agent-listings:'
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.startsWith(prefix)) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const listings = JSON.parse(raw)
      if (!Array.isArray(listings)) continue
      localStorage.setItem(
        key,
        JSON.stringify(listings.filter((item) => item.id !== propertyId)),
      )
    }
  } catch {
    // ignore storage errors
  }
}

const EMPTY_CATALOG = []

export function getListingCatalog() {
  return dbRead('listing-catalog', 'global', EMPTY_CATALOG)
}

export function saveListingCatalog(listings) {
  return dbWrite('listing-catalog', 'global', listings)
}

export function upsertListingInCatalog(property) {
  return dbUpdate('listing-catalog', 'global', EMPTY_CATALOG, (listings) => {
    const exists = listings.some((item) => item.id === property.id)
    if (exists) {
      return listings.map((item) => (item.id === property.id ? property : item))
    }
    return [property, ...listings]
  })
}

export function deleteListingFromCatalog(propertyId) {
  return dbUpdate('listing-catalog', 'global', EMPTY_CATALOG, (listings) =>
    listings.filter((item) => item.id !== propertyId),
  )
}
