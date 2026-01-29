'use client'

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment"
      className="floating-whatsapp"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <span className="whatsapp-icon">💬</span>
      <span className="whatsapp-text">Chat with us</span>
    </a>
  )
}
