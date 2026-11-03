export const ROLES = {
  BUYER: 'buyer',
  AGENT: 'agent',
  ADMIN: 'admin',
}

export const ROLE_LABELS = {
  [ROLES.BUYER]: 'Buyer',
  [ROLES.AGENT]: 'Agent / Seller',
  [ROLES.ADMIN]: 'Admin',
}

export function normalizeRole(value) {
  if (value === ROLES.ADMIN || value === 'Admin') {
    return ROLES.ADMIN
  }
  if (value === ROLES.AGENT || value === 'seller' || value === 'Agent/Seller') {
    return ROLES.AGENT
  }
  if (value === ROLES.BUYER || value === 'Buyer') {
    return ROLES.BUYER
  }
  return null
}

export function canSaveFavorites(role) {
  return role === ROLES.BUYER || role === ROLES.AGENT
}

export function canManageListings(role) {
  return role === ROLES.AGENT
}

export function canModerateListings(role) {
  return role === ROLES.ADMIN
}
