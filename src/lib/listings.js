export const LISTING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export function normalizeListing(property) {
  return {
    ...property,
    status: property.status || LISTING_STATUS.APPROVED,
  }
}

export function isApprovedListing(property) {
  return normalizeListing(property).status === LISTING_STATUS.APPROVED
}

export function isPendingListing(property) {
  return normalizeListing(property).status === LISTING_STATUS.PENDING
}

export function statusLabel(status) {
  if (status === LISTING_STATUS.PENDING) return 'Pending review'
  if (status === LISTING_STATUS.REJECTED) return 'Rejected'
  return 'Approved'
}
