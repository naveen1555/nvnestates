import { useEffect, useMemo, useState } from 'react'
import { formatCurrency, formatPrice } from '../lib/format'
import { calculateMortgage, DEFAULT_ANNUAL_TAX_RATE } from '../lib/mortgage'

const TERM_OPTIONS = [10, 15, 20, 25, 30]

const DEFAULTS = {
  homePrice: 18500000,
  downPaymentPercent: 20,
  interestRate: 8.5,
  loanTermYears: 20,
}

export function MortgageCalculator({ seedPrice = null }) {
  const [homePrice, setHomePrice] = useState(DEFAULTS.homePrice)
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULTS.downPaymentPercent)
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate)
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears)

  useEffect(() => {
    if (typeof seedPrice === 'number' && seedPrice > 0) {
      setHomePrice(seedPrice)
    }
  }, [seedPrice])

  const result = useMemo(
    () =>
      calculateMortgage({
        homePrice,
        downPaymentPercent,
        interestRate,
        loanTermYears,
      }),
    [downPaymentPercent, homePrice, interestRate, loanTermYears],
  )

  return (
    <section className="mortgage" id="mortgage" aria-labelledby="mortgage-title">
      <div className="mortgage__intro">
        <p className="eyebrow">Payment estimate</p>
        <h2 id="mortgage-title">Mortgage calculator</h2>
        <p className="mortgage__lede">
          Adjust price, down payment, rate, and term to see a monthly estimate. Taxes use a{' '}
          {DEFAULT_ANNUAL_TAX_RATE}% annual property-tax assumption.
        </p>
      </div>

      <div className="mortgage__panel">
        <div className="mortgage__controls">
          <label className="mortgage-field">
            <span className="mortgage-field__top">
              <span className="field__label">Home price</span>
              <span className="mortgage-field__value">{formatPrice(homePrice)}</span>
            </span>
            <input
              type="range"
              min={2500000}
              max={75000000}
              step={100000}
              value={homePrice}
              onChange={(event) => setHomePrice(Number(event.target.value))}
            />
            <input
              type="number"
              className="mortgage-field__number"
              min={1000000}
              max={100000000}
              step={100000}
              value={homePrice}
              onChange={(event) => setHomePrice(Number(event.target.value) || 0)}
              aria-label="Home price in rupees"
            />
          </label>

          <label className="mortgage-field">
            <span className="mortgage-field__top">
              <span className="field__label">Down payment</span>
              <span className="mortgage-field__value">
                {downPaymentPercent}% · {formatCurrency(result.downPayment)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={90}
              step={1}
              value={downPaymentPercent}
              onChange={(event) => setDownPaymentPercent(Number(event.target.value))}
            />
          </label>

          <label className="mortgage-field">
            <span className="mortgage-field__top">
              <span className="field__label">Interest rate</span>
              <span className="mortgage-field__value">{interestRate.toFixed(1)}%</span>
            </span>
            <input
              type="range"
              min={4}
              max={16}
              step={0.1}
              value={interestRate}
              onChange={(event) => setInterestRate(Number(event.target.value))}
            />
          </label>

          <fieldset className="mortgage-field mortgage-field--terms">
            <legend className="field__label">Loan term (years)</legend>
            <div className="chip-row">
              {TERM_OPTIONS.map((years) => {
                const active = loanTermYears === years
                return (
                  <button
                    key={years}
                    type="button"
                    className={active ? 'chip is-active' : 'chip'}
                    aria-pressed={active}
                    onClick={() => setLoanTermYears(years)}
                  >
                    {years}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>

        <div className="mortgage__results">
          <p className="mortgage__monthly-label">Estimated monthly payment</p>
          <p className="mortgage__monthly">{formatCurrency(result.monthlyPayment)}</p>
          <p className="mortgage__loan">
            Loan amount {formatCurrency(result.loanAmount)} over {loanTermYears} years
          </p>

          <div
            className="mortgage-bar"
            role="img"
            aria-label={`Payment breakdown: principal ${Math.round(result.principalShare)} percent, taxes ${Math.round(result.taxShare)} percent`}
          >
            <span className="mortgage-bar__principal" style={{ width: `${result.principalShare}%` }} />
            <span className="mortgage-bar__taxes" style={{ width: `${result.taxShare}%` }} />
          </div>

          <ul className="mortgage-legend">
            <li>
              <span className="mortgage-swatch mortgage-swatch--principal" />
              <div>
                <p>Principal</p>
                <strong>{formatCurrency(result.principal)}</strong>
              </div>
              <span className="mortgage-legend__share">{Math.round(result.principalShare)}%</span>
            </li>
            <li>
              <span className="mortgage-swatch mortgage-swatch--taxes" />
              <div>
                <p>Taxes</p>
                <strong>{formatCurrency(result.taxes)}</strong>
              </div>
              <span className="mortgage-legend__share">{Math.round(result.taxShare)}%</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
