/**
 * Lightweight client-side database backed by localStorage.
 * Swap these helpers for a real API/DB later without changing page code.
 */

function key(collection, scope = 'global') {
  return `nvnestate:db:${collection}:${scope}`
}

export function dbRead(collection, scope = 'global', fallback) {
  try {
    const raw = localStorage.getItem(key(collection, scope))
    if (!raw) return structuredClone(fallback)
    return JSON.parse(raw)
  } catch {
    return structuredClone(fallback)
  }
}

export function dbWrite(collection, scope, value) {
  localStorage.setItem(key(collection, scope), JSON.stringify(value))
  return value
}

export function dbUpdate(collection, scope, fallback, updater) {
  const current = dbRead(collection, scope, fallback)
  const next = updater(current)
  return dbWrite(collection, scope, next)
}
