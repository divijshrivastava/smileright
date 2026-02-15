'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

interface TreatmentItem {
    slug: string
    title: string
}

export default function TreatmentsDropdown() {
    const [treatments, setTreatments] = useState<TreatmentItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLLIElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Fetch published services from the API
        async function fetchServices() {
            try {
                const { createClient } = await import('@supabase/supabase-js')
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                )

                const { data: services } = await supabase
                    .from('services')
                    .select('slug, title, display_order')
                    .eq('is_published', true)
                    .order('display_order', { ascending: true })

                if (services && services.length > 0) {
                    setTreatments(services.map(s => ({ slug: s.slug, title: s.title })))
                } else {
                    // Fallback to hardcoded list
                    setTreatments(fallbackTreatments)
                }
            } catch {
                setTreatments(fallbackTreatments)
            }
        }

        fetchServices()
    }, [])

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        // Small delay to allow mouse to move to dropdown
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false)
        }, 150)
    }

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <li
            ref={dropdownRef}
            className="nav-dropdown-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                href="/treatments-and-services"
                className="nav-dropdown-trigger"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                Treatments
                <svg
                    className={`nav-dropdown-chevron ${isOpen ? 'open' : ''}`}
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2 3.5L5 6.5L8 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </Link>

            <div className={`nav-mega-dropdown ${isOpen ? 'visible' : ''}`}>
                <div className="nav-mega-dropdown-inner">
                    <ul className="nav-mega-dropdown-list">
                        {treatments.map((treatment) => (
                            <li key={treatment.slug}>
                                <Link
                                    href={`/treatments-and-services/${treatment.slug}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {treatment.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="nav-mega-dropdown-footer">
                        <Link
                            href="/treatments-and-services"
                            className="nav-mega-dropdown-view-all"
                            onClick={() => setIsOpen(false)}
                        >
                            View All Treatments →
                        </Link>
                    </div>
                </div>
            </div>
        </li>
    )
}

// Fallback treatments if database fetch fails
const fallbackTreatments: TreatmentItem[] = [
    { slug: 'dental-implants', title: 'Dental Implants' },
    { slug: 'root-canal-treatment', title: 'Root Canal Treatment' },
    { slug: 'teeth-whitening', title: 'Teeth Whitening' },
    { slug: 'braces-and-orthodontics', title: 'Braces & Orthodontics' },
    { slug: 'cosmetic-dentistry', title: 'Cosmetic Dentistry' },
    { slug: 'emergency-dental-care', title: 'Emergency Dental Care' },
    { slug: 'pediatric-dentistry', title: 'Pediatric Dentistry' },
]
