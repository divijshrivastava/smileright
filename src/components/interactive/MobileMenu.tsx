'use client'

import { useState } from 'react'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="mobile-menu-toggle"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav-links nav-links-mobile${isOpen ? ' active' : ''}`} id="navLinks">
        <li><a href="#home" onClick={() => setIsOpen(false)}>Home</a></li>
        <li><a href="#about" onClick={() => setIsOpen(false)}>About</a></li>
        <li><a href="#services" onClick={() => setIsOpen(false)}>Services</a></li>
        <li><a href="#gallery" onClick={() => setIsOpen(false)}>Gallery</a></li>
        <li><a href="#testimonials" onClick={() => setIsOpen(false)}>Reviews</a></li>
        <li><a href="#contact" onClick={() => setIsOpen(false)}>Contact</a></li>
        <li className="mobile-menu-cta">
          <a href="tel:+917977991130" className="btn btn-primary">
            <span className="btn-icon">📞</span> Call Now
          </a>
        </li>
        <li className="mobile-menu-cta">
          <a 
            href="https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="btn-icon">💬</span> WhatsApp
          </a>
        </li>
      </ul>
    </>
  )
}
