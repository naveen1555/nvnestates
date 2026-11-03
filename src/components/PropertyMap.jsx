import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { formatPrice } from '../lib/format'
import 'leaflet/dist/leaflet.css'

const INDIA_CENTER = [22.5, 78.5]

function createPriceIcon(price, active) {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<span class="map-pin${active ? ' is-active' : ''}">${formatPrice(price)}</span>`,
    iconSize: [96, 36],
    iconAnchor: [48, 36],
    popupAnchor: [0, -34],
  })
}

function MapSync({ properties, activeId, focusSource }) {
  const map = useMap()

  useEffect(() => {
    if (properties.length === 0) {
      map.setView(INDIA_CENTER, 5)
      return
    }

    if (properties.length === 1) {
      map.flyTo(properties[0].coordinates, 12, { duration: 0.65 })
      return
    }

    const bounds = L.latLngBounds(properties.map((property) => property.coordinates))
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11, animate: true })
  }, [map, properties])

  useEffect(() => {
    if (!activeId || focusSource !== 'list') return

    const property = properties.find((item) => item.id === activeId)
    if (!property) return

    map.flyTo(property.coordinates, Math.max(map.getZoom(), 11), { duration: 0.55 })
  }, [activeId, focusSource, map, properties])

  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    function handleResize() {
      map.invalidateSize()
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleResize)
    }
  }, [map, properties.length])

  return null
}

export function PropertyMap({ properties, activeId, focusSource, onSelect }) {
  const icons = useMemo(() => {
    const next = new Map()
    for (const property of properties) {
      next.set(property.id, {
        idle: createPriceIcon(property.price, false),
        active: createPriceIcon(property.price, true),
      })
    }
    return next
  }, [properties])

  return (
    <div className="map-shell">
      <MapContainer
        className="map-shell__canvas"
        center={INDIA_CENTER}
        zoom={5}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <MapSync properties={properties} activeId={activeId} focusSource={focusSource} />
        {properties.map((property) => {
          const set = icons.get(property.id)
          const active = property.id === activeId
          return (
            <Marker
              key={property.id}
              position={property.coordinates}
              icon={active ? set.active : set.idle}
              zIndexOffset={active ? 1000 : 0}
              eventHandlers={{
                click: () => onSelect(property.id),
              }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{property.title}</strong>
                  <span>{formatPrice(property.price)}</span>
                  <span>{property.location}</span>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      <p className="map-shell__note">Pins match the filtered list</p>
    </div>
  )
}
