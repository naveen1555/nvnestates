/** Estimated annual property tax as a percent of home price. */
export const DEFAULT_ANNUAL_TAX_RATE = 0.75

export function calculateMortgage({
  homePrice,
  downPaymentPercent,
  interestRate,
  loanTermYears,
  annualTaxRate = DEFAULT_ANNUAL_TAX_RATE,
}) {
  const price = Math.max(0, Number(homePrice) || 0)
  const downPct = clamp(Number(downPaymentPercent) || 0, 0, 100)
  const rate = Math.max(0, Number(interestRate) || 0)
  const years = Math.max(0, Number(loanTermYears) || 0)

  const downPayment = price * (downPct / 100)
  const principal = Math.max(0, price - downPayment)
  const months = Math.round(years * 12)
  const monthlyRate = rate / 100 / 12

  let principalPayment = 0
  if (months > 0 && principal > 0) {
    if (monthlyRate === 0) {
      principalPayment = principal / months
    } else {
      const growth = (1 + monthlyRate) ** months
      principalPayment = (principal * monthlyRate * growth) / (growth - 1)
    }
  }

  const taxes = (price * (annualTaxRate / 100)) / 12
  const monthlyPayment = principalPayment + taxes
  const total = principalPayment + taxes

  return {
    downPayment,
    loanAmount: principal,
    principal: principalPayment,
    taxes,
    monthlyPayment,
    principalShare: total > 0 ? (principalPayment / total) * 100 : 0,
    taxShare: total > 0 ? (taxes / total) * 100 : 0,
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
