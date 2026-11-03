export function formatPrice(amount) {
  if (amount >= 10000000) {
    const crores = amount / 10000000
    return `₹${trimNumber(crores)} Cr`
  }

  const lakhs = amount / 100000
  return `₹${trimNumber(lakhs)} L`
}

function trimNumber(value) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatSqft(sqft) {
  return `${new Intl.NumberFormat('en-IN').format(sqft)} sq.ft`
}

export function formatCurrency(amount, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(Math.round(amount))
}
