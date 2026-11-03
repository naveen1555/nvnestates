export const LISTING_STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'location', label: 'Location' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'photos', label: 'Photos' },
]

export const AMENITY_OPTIONS = [
  'Parking',
  'Lift',
  'Power backup',
  'Gym',
  'Swimming pool',
  'Garden',
  '24/7 security',
  'Furnished',
  'Balcony',
  'Air conditioning',
  'Pet friendly',
  'Clubhouse',
]

export const LISTING_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Commercial', 'Land']

export function createEmptyListingDraft() {
  return {
    title: '',
    price: '',
    description: '',
    type: 'Apartment',
    bhk: '2',
    bathrooms: '2',
    sqft: '',
    address: '',
    latitude: '',
    longitude: '',
    pinConfirmed: false,
    amenities: [],
    images: [],
  }
}

export function validateListingStep(stepIndex, draft) {
  const errors = {}

  if (stepIndex === 0) {
    if (draft.title.trim().length < 5) {
      errors.title = 'Add a title of at least 5 characters.'
    }
    const price = Number(draft.price)
    if (!Number.isFinite(price) || price < 100000) {
      errors.price = 'Enter a price of at least ₹1,00,000.'
    }
    if (draft.description.trim().length < 20) {
      errors.description = 'Add a short description (20+ characters).'
    }
    const sqft = Number(draft.sqft)
    if (!Number.isFinite(sqft) || sqft < 100) {
      errors.sqft = 'Enter built-up area in sq.ft.'
    }
  }

  if (stepIndex === 1) {
    if (draft.address.trim().length < 5) {
      errors.address = 'Enter a neighbourhood or full address.'
    }
    const lat = Number(draft.latitude)
    const lng = Number(draft.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      errors.pin = 'Drop a pin on the map to set the property location.'
    } else if (!draft.pinConfirmed) {
      errors.pin = 'Confirm the pinned location before continuing.'
    }
  }

  if (stepIndex === 3 && draft.images.length === 0) {
    errors.images = 'Upload at least one photo of the property.'
  }

  return errors
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

/** Turn uploaded File objects into durable data URLs (blob: previews are temporary). */
export async function imagesToDataUrls(images) {
  return Promise.all(
    images.map(async (image) => {
      if (image.file instanceof File) {
        return fileToDataUrl(image.file)
      }
      if (typeof image.preview === 'string' && image.preview.startsWith('data:')) {
        return image.preview
      }
      return ''
    }),
  )
}

export async function draftToProperty(draft, { submittedBy = null } = {}) {
  const slug = draft.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)

  const amenities = draft.amenities
  const bhk = draft.type === 'Commercial' || draft.type === 'Land' ? 0 : Number(draft.bhk) || 0
  const bathrooms =
    draft.type === 'Land' ? 0 : Math.max(0, Number(draft.bathrooms) || 0)
  const imageUrls = (await imagesToDataUrls(draft.images)).filter(Boolean)

  return {
    id: `${slug || 'listing'}-${Date.now().toString(36)}`,
    title: draft.title.trim(),
    price: Number(draft.price),
    location: draft.address.trim(),
    coordinates: [Number(draft.latitude), Number(draft.longitude)],
    bhk,
    bathrooms,
    sqft: Number(draft.sqft),
    image: imageUrls[0] || '',
    images: imageUrls,
    imageAlt: `Photo of ${draft.title.trim()}`,
    type: draft.type,
    furnishing: amenities.includes('Furnished') ? 'Furnished' : 'Unfurnished',
    parking: amenities.includes('Parking') ? 'Available' : 'Not specified',
    floor: amenities.includes('Lift') ? 'Lift access' : 'Ground / walk-up',
    description: draft.description.trim(),
    amenities,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    submittedBy,
  }
}

export function revokeDraftImages(draft) {
  for (const image of draft.images) {
    if (image.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(image.preview)
    }
  }
}
