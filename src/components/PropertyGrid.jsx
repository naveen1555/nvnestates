import { useEffect, useRef } from 'react'
import { PropertyCard } from './PropertyCard'

export function PropertyGrid({
  properties,
  favoriteIds,
  activeId,
  focusSource,
  emptyTitle,
  emptyBody,
  onActivate,
  onToggleFavorite,
  onViewDetails,
}) {
  const cardRefs = useRef(new Map())

  useEffect(() => {
    if (!activeId || focusSource !== 'map') return
    const node = cardRefs.current.get(activeId)
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeId, focusSource])

  if (properties.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">{emptyTitle}</p>
        <p>{emptyBody}</p>
      </div>
    )
  }

  return (
    <div className="grid">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          saved={favoriteIds.includes(property.id)}
          active={property.id === activeId}
          cardRef={(node) => {
            if (node) cardRefs.current.set(property.id, node)
            else cardRefs.current.delete(property.id)
          }}
          onActivate={onActivate}
          onToggleFavorite={onToggleFavorite}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
