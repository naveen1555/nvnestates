import { formatPrice } from './format'

export function estimatePriceRange({ address, type, bhk, sqft }, listings) {
  const area = Number(sqft) || 0
  const beds = Number(bhk) || 0
  const cityHint = String(address || '')
    .toLowerCase()
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  let comps = listings.filter((property) => property.type === type)

  if (cityHint.length) {
    const local = comps.filter((property) =>
      cityHint.some((hint) => property.location.toLowerCase().includes(hint)),
    )
    if (local.length >= 2) comps = local
  }

  if (beds > 0) {
    const byBeds = comps.filter((property) =>
      beds >= 3 ? property.bhk >= 3 : property.bhk === beds,
    )
    if (byBeds.length >= 2) comps = byBeds
  }

  if (area > 0) {
    const bySize = comps.filter((property) => {
      const delta = Math.abs(property.sqft - area) / area
      return delta <= 0.35
    })
    if (bySize.length >= 1) comps = bySize
  }

  if (comps.length === 0) {
    comps = listings.slice(0, 5)
  }

  const pricesPerSqft = comps
    .filter((property) => property.sqft > 0)
    .map((property) => property.price / property.sqft)

  const avgPsf =
    pricesPerSqft.reduce((sum, value) => sum + value, 0) / Math.max(pricesPerSqft.length, 1)

  const midpoint = area > 0 ? avgPsf * area : comps.reduce((sum, p) => sum + p.price, 0) / comps.length
  const low = Math.round(midpoint * 0.92)
  const high = Math.round(midpoint * 1.08)

  return {
    low,
    mid: Math.round(midpoint),
    high,
    compsUsed: comps.length,
    label: `${formatPrice(low)} – ${formatPrice(high)}`,
    midLabel: formatPrice(Math.round(midpoint)),
  }
}
