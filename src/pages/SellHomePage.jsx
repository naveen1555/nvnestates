import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import { createLead } from '../db/userData'
import { LISTING_TYPES } from '../lib/listingForm'
import { estimatePriceRange } from '../lib/priceEstimate'
import { formatCurrency, formatPrice } from '../lib/format'

const STEPS = ['Address', 'Details', 'Contact', 'Estimate']

const EMPTY = {
  address: '',
  type: 'Apartment',
  bhk: '2',
  bathrooms: '2',
  sqft: '',
  name: '',
  email: '',
  phone: '',
}

export function SellHomePage({ listings }) {
  const auth = useAppAuth()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [lead, setLead] = useState(null)

  const estimate = useMemo(
    () =>
      estimatePriceRange(
        {
          address: draft.address,
          type: draft.type,
          bhk: draft.bhk,
          sqft: draft.sqft,
        },
        listings,
      ),
    [draft.address, draft.bhk, draft.sqft, draft.type, listings],
  )

  function update(patch) {
    setDraft((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch)) delete next[key]
      return next
    })
  }

  function validate(currentStep) {
    const next = {}
    if (currentStep === 0 && draft.address.trim().length < 5) {
      next.address = 'Enter the property address or neighbourhood.'
    }
    if (currentStep === 1) {
      if (!Number(draft.sqft) || Number(draft.sqft) < 100) {
        next.sqft = 'Enter built-up area in sq.ft.'
      }
    }
    if (currentStep === 2) {
      if (draft.name.trim().length < 2) next.name = 'Enter your name.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
        next.email = 'Enter a valid email.'
      }
      if (draft.phone.replace(/\D/g, '').length < 10) {
        next.phone = 'Enter a valid phone number.'
      }
    }
    return next
  }

  function goNext() {
    const nextErrors = validate(step)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    if (step === STEPS.length - 2) {
      const record = createLead({
        ...draft,
        userId: auth.userId,
        estimateLow: estimate.low,
        estimateMid: estimate.mid,
        estimateHigh: estimate.high,
        compsUsed: estimate.compsUsed,
      })
      setLead(record)
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }

  function reset() {
    setDraft(EMPTY)
    setErrors({})
    setLead(null)
    setStep(0)
  }

  return (
    <main className="page sell-page">
      <section className="sell-hero">
        <div className="sell-hero__copy">
          <p className="eyebrow">Sell with NVN</p>
          <h1>Sell your home with a clear first estimate.</h1>
          <p>
            Start with the address, add a few property details, and we’ll store your lead and show an
            estimated price range from comparable listings.
          </p>
        </div>
      </section>

      <section className="listing-form__panel sell-form" aria-label="Sell your home form">
        <ol className="listing-form__steps sell-steps" aria-label="Sell form steps">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className={
                index === step ? 'listing-step is-current' : index < step ? 'listing-step is-done' : 'listing-step'
              }
            >
              <span className="listing-step__index">{index + 1}</span>
              <span className="listing-step__label">{label}</span>
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <div className="listing-form__fields">
            <label className="listing-field">
              <span className="field__label">Property address</span>
              <input
                type="text"
                value={draft.address}
                onChange={(event) => update({ address: event.target.value })}
                placeholder="12th Main, Indiranagar, Bengaluru"
                aria-invalid={Boolean(errors.address)}
              />
              {errors.address ? <span className="form-error">{errors.address}</span> : null}
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="listing-form__fields">
            <div className="listing-field-row">
              <label className="listing-field">
                <span className="field__label">Property type</span>
                <select value={draft.type} onChange={(event) => update({ type: event.target.value })}>
                  {LISTING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="listing-field">
                <span className="field__label">Sq. ft.</span>
                <input
                  type="number"
                  min="100"
                  value={draft.sqft}
                  onChange={(event) => update({ sqft: event.target.value })}
                  placeholder="1680"
                  aria-invalid={Boolean(errors.sqft)}
                />
                {errors.sqft ? <span className="form-error">{errors.sqft}</span> : null}
              </label>
            </div>
            <div className="listing-field-row">
              <label className="listing-field">
                <span className="field__label">Bedrooms</span>
                <select value={draft.bhk} onChange={(event) => update({ bhk: event.target.value })}>
                  {[0, 1, 2, 3, 4, 5].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
              <label className="listing-field">
                <span className="field__label">Bathrooms</span>
                <select
                  value={draft.bathrooms}
                  onChange={(event) => update({ bathrooms: event.target.value })}
                >
                  {[0, 1, 2, 3, 4, 5].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="listing-form__fields">
            <label className="listing-field">
              <span className="field__label">Full name</span>
              <input
                type="text"
                value={draft.name}
                onChange={(event) => update({ name: event.target.value })}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? <span className="form-error">{errors.name}</span> : null}
            </label>
            <div className="listing-field-row">
              <label className="listing-field">
                <span className="field__label">Email</span>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) => update({ email: event.target.value })}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <span className="form-error">{errors.email}</span> : null}
              </label>
              <label className="listing-field">
                <span className="field__label">Phone</span>
                <input
                  type="tel"
                  value={draft.phone}
                  onChange={(event) => update({ phone: event.target.value })}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone ? <span className="form-error">{errors.phone}</span> : null}
              </label>
            </div>
          </div>
        ) : null}

        {step === 3 && lead ? (
          <div className="sell-estimate">
            <p className="eyebrow">Lead saved</p>
            <h2>Estimated price range</h2>
            <p className="sell-estimate__range">{estimate.label}</p>
            <p className="sell-estimate__mid">Midpoint around {estimate.midLabel}</p>
            <p>
              Based on {estimate.compsUsed} comparable{' '}
              {estimate.compsUsed === 1 ? 'listing' : 'listings'} in our inventory. Lead ID{' '}
              <code>{lead.id}</code> is stored in the local leads database.
            </p>
            <dl className="sell-estimate__facts">
              <div>
                <dt>Address</dt>
                <dd>{draft.address}</dd>
              </div>
              <div>
                <dt>Details</dt>
                <dd>
                  {draft.type} · {draft.bhk} BHK · {draft.sqft} sq.ft
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>
                  {draft.name} · {draft.email}
                </dd>
              </div>
              <div>
                <dt>Range</dt>
                <dd>
                  {formatCurrency(estimate.low)} – {formatCurrency(estimate.high)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="listing-form__nav">
          {step > 0 && step < 3 ? (
            <button type="button" className="listing-form__secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : (
            <Link className="listing-form__secondary" to="/">
              Browse homes
            </Link>
          )}
          {step < 3 ? (
            <button type="button" className="listing-form__primary" onClick={goNext}>
              {step === 2 ? 'Save lead & see estimate' : 'Continue'}
            </button>
          ) : (
            <button type="button" className="listing-form__primary" onClick={reset}>
              Start another valuation
            </button>
          )}
        </div>
      </section>

      <p className="sell-footnote">
        Live estimate preview for {draft.address || 'your address'}: {formatPrice(estimate.low)} –{' '}
        {formatPrice(estimate.high)}
      </p>
    </main>
  )
}
