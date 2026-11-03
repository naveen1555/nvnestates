import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import { formatCurrency, formatPrice } from '../lib/format'
import {
  AMENITY_OPTIONS,
  LISTING_STEPS,
  LISTING_TYPES,
  createEmptyListingDraft,
  draftToProperty,
  revokeDraftImages,
  validateListingStep,
} from '../lib/listingForm'
import { ImageUploader } from './ImageUploader'
import { LocationPinMap } from './LocationPinMap'

export function ListingSubmitForm({ onSubmitListing }) {
  const auth = useAppAuth()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState(createEmptyListingDraft)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)

  const progress = useMemo(() => ((step + 1) / LISTING_STEPS.length) * 100, [step])
  const hasPin =
    draft.latitude !== '' &&
    draft.longitude !== '' &&
    Number.isFinite(Number(draft.latitude)) &&
    Number.isFinite(Number(draft.longitude))

  function update(patch) {
    setDraft((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch)) {
        delete next[key]
      }
      return next
    })
  }

  function clearPinError() {
    setErrors((current) => {
      if (!current.pin) return current
      const next = { ...current }
      delete next.pin
      return next
    })
  }

  function toggleAmenity(amenity) {
    setDraft((current) => {
      const amenities = current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity]
      return { ...current, amenities }
    })
  }

  function goNext() {
    const nextErrors = validateListingStep(step, draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setStep((current) => Math.min(current + 1, LISTING_STEPS.length - 1))
  }

  function goBack() {
    setErrors({})
    setStep((current) => Math.max(current - 1, 0))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateListingStep(step, draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      // Convert File uploads to data URLs before revoking temporary blob: previews
      const property = await draftToProperty(draft, { submittedBy: auth.userId })
      if (!property.image) {
        setErrors({ images: 'Could not read the uploaded photo. Try another image.' })
        return
      }
      onSubmitListing(property)
      setSubmitted({
        id: property.id,
        title: property.title,
        location: property.location,
      })
      revokeDraftImages(draft)
      setDraft(createEmptyListingDraft())
      setStep(0)
      setErrors({})
    } catch {
      setErrors({ images: 'Could not save uploaded photos. Try again with smaller images.' })
    }
  }

  function startAnother() {
    setSubmitted(null)
  }

  if (submitted) {
    return (
      <section className="listing-form" id="submit-listing" aria-labelledby="listing-form-title">
        <div className="listing-form__intro">
          <p className="eyebrow">Agent tools</p>
          <h2 id="listing-form-title">Successfully submitted</h2>
        </div>
        <div className="listing-form__success" role="status">
          <p className="listing-form__success-title">Sent for admin approval.</p>
          <p>
            <strong>{submitted.title}</strong> at {submitted.location} is pending review. It will
            appear on the public grid after an admin approves it. Reference ID{' '}
            <code>{submitted.id}</code>.
          </p>
          <div className="listing-form__nav">
            <Link className="listing-form__primary" to="/">
              Back to browse
            </Link>
            <button type="button" className="listing-form__secondary" onClick={startAnother}>
              Submit another
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="listing-form" id="submit-listing" aria-labelledby="listing-form-title">
      <div className="listing-form__intro">
        <p className="eyebrow">Agent tools</p>
        <h2 id="listing-form-title">Submit a new listing</h2>
        <p className="listing-form__lede">
          A four-step form for title, price, location, amenities, and photos. Drafts stay on this
          device until you submit.
        </p>
      </div>

      <form className="listing-form__panel" onSubmit={handleSubmit} noValidate>
        <div className="listing-form__progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <ol className="listing-form__steps" aria-label="Form steps">
          {LISTING_STEPS.map((item, index) => {
            const state = index === step ? 'is-current' : index < step ? 'is-done' : ''
            return (
              <li key={item.id} className={state ? `listing-step ${state}` : 'listing-step'}>
                <span className="listing-step__index">{index + 1}</span>
                <span className="listing-step__label">{item.label}</span>
              </li>
            )
          })}
        </ol>

        {step === 0 ? (
          <div className="listing-form__fields">
            <label className="listing-field">
              <span className="field__label">Title</span>
              <input
                type="text"
                value={draft.title}
                onChange={(event) => update({ title: event.target.value })}
                placeholder="e.g. Sunlit 3 BHK on 12th Main"
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title ? <span className="form-error">{errors.title}</span> : null}
            </label>

            <div className="listing-field-row">
              <label className="listing-field">
                <span className="field__label">Price (₹)</span>
                <input
                  type="number"
                  min="100000"
                  step="50000"
                  value={draft.price}
                  onChange={(event) => update({ price: event.target.value })}
                  placeholder="18500000"
                  aria-invalid={Boolean(errors.price)}
                />
                {draft.price ? (
                  <span className="listing-field__hint">{formatPrice(Number(draft.price) || 0)}</span>
                ) : null}
                {errors.price ? <span className="form-error">{errors.price}</span> : null}
              </label>

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
            </div>

            <div className="listing-field-row listing-field-row--three">
              <label className="listing-field">
                <span className="field__label">Bedrooms (BHK)</span>
                <select
                  value={draft.bhk}
                  onChange={(event) => update({ bhk: event.target.value })}
                  disabled={draft.type === 'Commercial' || draft.type === 'Land'}
                >
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
                  disabled={draft.type === 'Land'}
                >
                  {[0, 1, 2, 3, 4, 5].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>

              <label className="listing-field">
                <span className="field__label">Sq. ft.</span>
                <input
                  type="number"
                  min="100"
                  step="10"
                  value={draft.sqft}
                  onChange={(event) => update({ sqft: event.target.value })}
                  placeholder="1680"
                  aria-invalid={Boolean(errors.sqft)}
                />
                {errors.sqft ? <span className="form-error">{errors.sqft}</span> : null}
              </label>
            </div>

            <label className="listing-field">
              <span className="field__label">Description</span>
              <textarea
                rows="5"
                value={draft.description}
                onChange={(event) => update({ description: event.target.value })}
                placeholder="Describe light, layout, finishes, and nearby landmarks."
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description ? <span className="form-error">{errors.description}</span> : null}
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="listing-form__fields">
            <label className="listing-field">
              <span className="field__label">Address / neighbourhood</span>
              <input
                type="text"
                value={draft.address}
                onChange={(event) => update({ address: event.target.value })}
                placeholder="Indiranagar, Bengaluru"
                aria-invalid={Boolean(errors.address)}
              />
              {errors.address ? <span className="form-error">{errors.address}</span> : null}
            </label>

            <div className="listing-field">
              <span className="field__label">Pin on map</span>
              <LocationPinMap
                latitude={hasPin ? Number(draft.latitude) : NaN}
                longitude={hasPin ? Number(draft.longitude) : NaN}
                confirmed={draft.pinConfirmed}
                interactive={!draft.pinConfirmed}
                invalid={Boolean(errors.pin)}
                onPick={(lat, lng) => {
                  update({
                    latitude: String(Number(lat.toFixed(6))),
                    longitude: String(Number(lng.toFixed(6))),
                    pinConfirmed: false,
                  })
                  clearPinError()
                }}
              />
              {errors.pin ? <span className="form-error">{errors.pin}</span> : null}
            </div>

            {hasPin ? (
              <div
                className={
                  draft.pinConfirmed
                    ? 'location-confirm location-confirm--done'
                    : 'location-confirm'
                }
                role="group"
                aria-label="Confirm pinned location"
              >
                <div className="location-confirm__copy">
                  <p className="eyebrow">{draft.pinConfirmed ? 'Confirmed' : 'Review pin'}</p>
                  <h3>
                    {draft.pinConfirmed
                      ? 'Location confirmed'
                      : 'Is this the right location?'}
                  </h3>
                  <p>
                    {draft.address.trim() || 'Your pinned spot'} · {Number(draft.latitude).toFixed(4)},{' '}
                    {Number(draft.longitude).toFixed(4)}
                  </p>
                </div>
                <div className="location-confirm__actions">
                  {draft.pinConfirmed ? (
                    <button
                      type="button"
                      className="listing-form__secondary"
                      onClick={() => update({ pinConfirmed: false })}
                    >
                      Adjust pin
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="listing-form__primary"
                      onClick={() => {
                        update({ pinConfirmed: true })
                        clearPinError()
                      }}
                    >
                      Confirm location
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="listing-form__fields">
            <fieldset className="listing-field listing-field--checks">
              <legend className="field__label">Amenities</legend>
              <div className="amenity-grid">
                {AMENITY_OPTIONS.map((amenity) => {
                  const checked = draft.amenities.includes(amenity)
                  return (
                    <label key={amenity} className={checked ? 'amenity is-checked' : 'amenity'}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAmenity(amenity)}
                      />
                      <span>{amenity}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="listing-form__fields">
            <ImageUploader
              images={draft.images}
              onChange={(images) => update({ images })}
              error={errors.images}
            />

            <div className="listing-review">
              <h3>Review</h3>
              <dl>
                <div>
                  <dt>Title</dt>
                  <dd>{draft.title || '—'}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>
                    {draft.price ? formatCurrency(Number(draft.price) || 0) : '—'} · {draft.type}
                  </dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>
                    {draft.address || '—'}
                    {draft.pinConfirmed ? ' · location confirmed' : ''}
                  </dd>
                </div>
                <div>
                  <dt>Amenities</dt>
                  <dd>{draft.amenities.length ? draft.amenities.join(', ') : 'None selected'}</dd>
                </div>
                <div>
                  <dt>Photos</dt>
                  <dd>
                    {draft.images.length} {draft.images.length === 1 ? 'file' : 'files'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}

        <div className="listing-form__nav">
          <button
            type="button"
            className="listing-form__secondary"
            onClick={goBack}
            disabled={step === 0}
          >
            Back
          </button>
          {step < LISTING_STEPS.length - 1 ? (
            <button type="button" className="listing-form__primary" onClick={goNext}>
              Continue
            </button>
          ) : (
            <button type="submit" className="listing-form__primary">
              Submit listing
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
