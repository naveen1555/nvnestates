import { formatPrice, formatSqft } from '../lib/format'
import { AreaIcon, BathIcon, BedIcon, HeartIcon, PinIcon } from './Icons'

export function PropertyCard({
  property,
  saved,
  active,
  cardRef,
  onActivate,
  onToggleFavorite,
  onViewDetails,
}) {
  const bathLabel = property.bathrooms === 1 ? 'Bath' : 'Baths'

  return (
    <article
      ref={cardRef}
      className={active ? 'card is-active' : 'card'}
      data-property-id={property.id}
      onMouseEnter={() => onActivate(property.id)}
      onFocusCapture={() => onActivate(property.id)}
    >
      <div className="card__media">
        <img src={property.image} alt={property.imageAlt} loading="lazy" />
        <button
          type="button"
          className={saved ? 'heart is-saved' : 'heart'}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${property.title} from saved homes` : `Save ${property.title}`}
          onClick={() => onToggleFavorite(property.id)}
        >
          <HeartIcon />
        </button>
      </div>

      <div className="card__body">
        <h2 className="card__title">{property.title}</h2>
        <p className="card__price">{formatPrice(property.price)}</p>
        <p className="card__location">
          <PinIcon />
          <span>{property.location}</span>
        </p>

        <ul className="specs">
          {property.bhk > 0 ? (
            <li>
              <BedIcon />
              <span>{property.bhk} BHK</span>
            </li>
          ) : (
            <li>
              <BedIcon />
              <span>{property.type}</span>
            </li>
          )}
          {property.bathrooms > 0 ? (
            <li>
              <BathIcon />
              <span>
                {property.bathrooms} {bathLabel}
              </span>
            </li>
          ) : null}
          <li>
            <AreaIcon />
            <span>{formatSqft(property.sqft)}</span>
          </li>
        </ul>

        <button type="button" className="card__cta" onClick={() => onViewDetails(property)}>
          View Details
        </button>
      </div>
    </article>
  )
}
