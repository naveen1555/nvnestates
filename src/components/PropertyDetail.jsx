import { useEffect, useMemo, useRef } from 'react'
import { formatPrice, formatSqft } from '../lib/format'
import { buildWhatsAppInquireUrl } from '../lib/whatsapp'
import { AreaIcon, BathIcon, BedIcon, HeartIcon, PinIcon, WhatsAppIcon } from './Icons'

export function PropertyDetail({ property, saved, onClose, onToggleFavorite }) {
  const dialogRef = useRef(null)
  const bathLabel = property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'
  const whatsappUrl = useMemo(() => buildWhatsAppInquireUrl(property), [property])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    dialog.showModal()

    function handleCancel(event) {
      event.preventDefault()
      onClose()
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('keydown', handleKeyDown)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('keydown', handleKeyDown)
      if (dialog.open) dialog.close()
    }
  }, [onClose])

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog ref={dialogRef} className="detail" aria-labelledby="detail-title" onClick={handleBackdropClick}>
      <div className="detail__panel">
        <div className="detail__media">
          <img src={property.image} alt={property.imageAlt} />
        </div>

        <div className="detail__content">
          <div className="detail__toolbar">
            <p className="detail__type">{property.type}</p>
            <button type="button" className="detail__close" onClick={onClose}>
              Close
            </button>
          </div>

          <h2 id="detail-title">{property.title}</h2>
          <p className="detail__price">{formatPrice(property.price)}</p>
          <p className="detail__location">
            <PinIcon />
            <span>{property.location}</span>
          </p>

          <ul className="specs specs--detail">
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

          <p className="detail__copy">{property.description}</p>

          <dl className="facts">
            <div>
              <dt>Furnishing</dt>
              <dd>{property.furnishing}</dd>
            </div>
            <div>
              <dt>Parking</dt>
              <dd>{property.parking}</dd>
            </div>
            <div>
              <dt>Floor</dt>
              <dd>{property.floor}</dd>
            </div>
          </dl>

          {property.amenities?.length ? (
            <div className="detail__amenities">
              <p className="field__label">Amenities</p>
              <ul>
                {property.amenities.map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="detail__actions">
            <a
              className="detail__whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              Inquire on WhatsApp
            </a>
            <button
              type="button"
              className={saved ? 'detail__save is-saved' : 'detail__save'}
              aria-pressed={saved}
              onClick={() => onToggleFavorite(property.id)}
            >
              <HeartIcon />
              {saved ? 'Saved' : 'Save this home'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
