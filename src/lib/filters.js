export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Commercial', 'Land']

export const BEDROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3+' },
]

export const PRICE_STEP = 500000

export function getPriceBounds(listings) {
  const prices = listings.map((property) => property.price)
  const min = Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP
  const max = Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP
  return { min, max }
}

export function createDefaultFilters(listings) {
  const { min, max } = getPriceBounds(listings)
  return {
    location: '',
    minPrice: min,
    maxPrice: max,
    types: [],
    bedrooms: [],
  }
}

export function hasActiveFilters(filters, bounds) {
  return (
    filters.location.trim() !== '' ||
    filters.minPrice !== bounds.min ||
    filters.maxPrice !== bounds.max ||
    filters.types.length > 0 ||
    filters.bedrooms.length > 0
  )
}

export function filterProperties(listings, filters) {
  const query = filters.location.trim().toLowerCase()

  return listings.filter((property) => {
    if (query) {
      const haystack = `${property.location} ${property.title}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (property.price < filters.minPrice || property.price > filters.maxPrice) {
      return false
    }

    if (filters.types.length > 0 && !filters.types.includes(property.type)) {
      return false
    }

    if (filters.bedrooms.length > 0) {
      const matchesBedroom = filters.bedrooms.some((option) =>
        option === 3 ? property.bhk >= 3 : property.bhk === option,
      )
      if (!matchesBedroom) return false
    }

    return true
  })
}
