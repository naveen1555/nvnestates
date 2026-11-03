import { formatPrice } from './format'

/** Digits only, country code included. Override with VITE_WHATSAPP_NUMBER. */
const DEFAULT_WHATSAPP_NUMBER = '919876543210'

export function getWhatsAppNumber() {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER
  return String(raw).replace(/\D/g, '')
}

export function buildWhatsAppInquireUrl(property) {
  const phone = getWhatsAppNumber()
  const message = [
    'Hi NVN Estate, I would like to inquire about this property:',
    '',
    `Title: ${property.title}`,
    `ID: ${property.id}`,
    `Price: ${formatPrice(property.price)}`,
  ].join('\n')

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
