import { formatPrice } from '../lib/format'
import { BEDROOM_OPTIONS, PRICE_STEP, PROPERTY_TYPES } from '../lib/filters'

export function SearchFilterBar({ filters, bounds, resultCount, onChange, onClear, canClear }) {
  const rangeSpan = Math.max(bounds.max - bounds.min, 1)
  const minPercent = ((filters.minPrice - bounds.min) / rangeSpan) * 100
  const maxPercent = ((filters.maxPrice - bounds.min) / rangeSpan) * 100

  function update(patch) {
    onChange({ ...filters, ...patch })
  }

  function setMinPrice(value) {
    update({ minPrice: Math.min(Number(value), filters.maxPrice) })
  }

  function setMaxPrice(value) {
    update({ maxPrice: Math.max(Number(value), filters.minPrice) })
  }

  function toggleType(type) {
    const types = filters.types.includes(type)
      ? filters.types.filter((item) => item !== type)
      : [...filters.types, type]
    update({ types })
  }

  function toggleBedroom(value) {
    const bedrooms = filters.bedrooms.includes(value)
      ? filters.bedrooms.filter((item) => item !== value)
      : [...filters.bedrooms, value]
    update({ bedrooms })
  }

  return (
    <section className="search-bar" aria-label="Search and filter homes">
      <div className="search-bar__top">
        <label className="field field--location">
          <span className="field__label">Location</span>
          <input
            type="search"
            className="field__input"
            placeholder="City, neighbourhood, or area"
            value={filters.location}
            onChange={(event) => update({ location: event.target.value })}
            autoComplete="off"
          />
        </label>

        <div className="field field--price">
          <div className="field__heading">
            <span className="field__label">Price range</span>
            <span className="field__value">
              {formatPrice(filters.minPrice)} – {formatPrice(filters.maxPrice)}
            </span>
          </div>

          <div
            className="range"
            style={{
              '--min': `${minPercent}%`,
              '--max': `${maxPercent}%`,
            }}
          >
            <label className="visually-hidden" htmlFor="price-min">
              Minimum price
            </label>
            <input
              id="price-min"
              className="range__input"
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={PRICE_STEP}
              value={filters.minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
            <label className="visually-hidden" htmlFor="price-max">
              Maximum price
            </label>
            <input
              id="price-max"
              className="range__input range__input--max"
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={PRICE_STEP}
              value={filters.maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="search-bar__bottom">
        <fieldset className="chip-group">
          <legend className="field__label">Property type</legend>
          <div className="chip-row">
            {PROPERTY_TYPES.map((type) => {
              const active = filters.types.includes(type)
              return (
                <button
                  key={type}
                  type="button"
                  className={active ? 'chip is-active' : 'chip'}
                  aria-pressed={active}
                  onClick={() => toggleType(type)}
                >
                  {type}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="chip-group">
          <legend className="field__label">Bedrooms</legend>
          <div className="chip-row">
            {BEDROOM_OPTIONS.map((option) => {
              const active = filters.bedrooms.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  className={active ? 'chip is-active' : 'chip'}
                  aria-pressed={active}
                  onClick={() => toggleBedroom(option.value)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="search-bar__meta">
          <p className="search-bar__count">
            {resultCount} {resultCount === 1 ? 'home' : 'homes'}
          </p>
          <button type="button" className="search-bar__clear" onClick={onClear} disabled={!canClear}>
            Clear filters
          </button>
        </div>
      </div>
    </section>
  )
}
