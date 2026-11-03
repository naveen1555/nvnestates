import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [12.9716, 77.5946]
const DEFAULT_ZOOM = 12

const pinIcon = L.divIcon({
  className: 'pin-picker-icon-wrap',
  html: '<span class="pin-picker-icon" aria-hidden="true"></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
})

const confirmedPinIcon = L.divIcon({
  className: 'pin-picker-icon-wrap',
  html: '<span class="pin-picker-icon pin-picker-icon--confirmed" aria-hidden="true"></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
})

function MapClickHandler({ enabled, onPick }) {
  useMapEvents({
    click(event) {
      if (!enabled) return
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

function MapViewport({ latitude, longitude, confirmed, interactive }) {
  const map = useMap()
  const hasPin = Number.isFinite(latitude) && Number.isFinite(longitude)

  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => cancelAnimationFrame(frame)
  }, [map, confirmed])

  useEffect(() => {
    if (interactive) {
      map.dragging.enable()
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
    } else {
      map.dragging.disable()
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
    }
  }, [interactive, map])

  useEffect(() => {
    if (!hasPin) return
    map.flyTo([latitude, longitude], confirmed ? 15 : Math.max(map.getZoom(), 13), {
      duration: 0.45,
    })
  }, [confirmed, hasPin, latitude, longitude, map])

  return null
}

export function LocationPinMap({
  latitude,
  longitude,
  onPick,
  invalid = false,
  confirmed = false,
  interactive = true,
}) {
  const hasPin = Number.isFinite(latitude) && Number.isFinite(longitude)
  const center = useMemo(
    () => (hasPin ? [latitude, longitude] : DEFAULT_CENTER),
    [hasPin, latitude, longitude],
  )

  function handleLocate() {
    if (!interactive || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onPick(position.coords.latitude, position.coords.longitude)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  let hint = 'Click the map to drop a pin at the property.'
  if (hasPin && !confirmed) {
    hint = 'Review the pin below, then confirm this location to continue.'
  } else if (confirmed) {
    hint = 'Location confirmed. Adjust the pin if you need to move it.'
  }

  return (
    <div
      className={[
        'pin-picker',
        invalid ? 'is-invalid' : '',
        confirmed ? 'is-confirmed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="pin-picker__toolbar">
        <p className="pin-picker__hint">{hint}</p>
        {interactive ? (
          <button type="button" className="auth-chip" onClick={handleLocate}>
            Use my location
          </button>
        ) : null}
      </div>

      <div className="pin-picker__map" role="application" aria-label="Pin property location on map">
        <MapContainer
          className="pin-picker__canvas"
          center={center}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={interactive}
          dragging={interactive}
          doubleClickZoom={interactive}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />
          <MapClickHandler enabled={interactive} onPick={onPick} />
          <MapViewport
            latitude={latitude}
            longitude={longitude}
            confirmed={confirmed}
            interactive={interactive}
          />
          {hasPin ? (
            <Marker
              position={[latitude, longitude]}
              icon={confirmed ? confirmedPinIcon : pinIcon}
              draggable={interactive}
              eventHandlers={{
                dragend(event) {
                  if (!interactive) return
                  const next = event.target.getLatLng()
                  onPick(next.lat, next.lng)
                },
              }}
            />
          ) : null}
        </MapContainer>
      </div>

      {hasPin ? (
        <p className="pin-picker__coords" aria-live="polite">
          {confirmed ? 'Confirmed' : 'Pinned'} · {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      ) : (
        <p className="pin-picker__coords pin-picker__coords--muted">No pin yet</p>
      )}
    </div>
  )
}
