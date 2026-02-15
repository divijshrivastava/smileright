'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface TreatmentItem {
    slug: string
    title: string
}

interface MobileTreatmentsAccordionProps {
    onLinkClick: () => void
}

export default function MobileTreatmentsAccordion({ onLinkClick }: MobileTreatmentsAccordionProps) {
    const [treatments, setTreatments] = useState<TreatmentItem[]>([])
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
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
                    setTreatments(fallbackTreatments)
                }
            } catch {
                setTreatments(fallbackTreatments)
            }
        }

        fetchServices()
    }, [])

    return (
        <li className="mobile-dropdown-wrapper">
            <div className="mobile-dropdown-header">
                <Link
                    href="/treatments-and-services"
                    onClick={onLinkClick}
                >
                    Treatments
                </Link>
                <button
                    className={`mobile-dropdown-toggle ${isExpanded ? 'open' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label="Toggle treatments submenu"
                    aria-expanded={isExpanded}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                            d="M3 4.5L6 7.5L9 4.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            <ul className={`mobile-dropdown-submenu ${isExpanded ? 'expanded' : ''}`}>
                {treatments.map((treatment) => (
                    <li key={treatment.slug}>
                        <Link
                            href={`/treatments-and-services/${treatment.slug}`}
                            onClick={onLinkClick}
                        >
                            {treatment.title}
                        </Link>
                    </li>
                ))}
                <li className="mobile-view-all">
                    <Link
                        href="/treatments-and-services"
                        onClick={onLinkClick}
                    >
                        View All Treatments →
                    </Link>
                </li>
            </ul>
        </li>
    )
}

const fallbackTreatments: TreatmentItem[] = [
    { slug: 'dental-implants', title: 'Dental Implants' },
    { slug: 'root-canal-treatment', title: 'Root Canal Treatment' },
    { slug: 'teeth-whitening', title: 'Teeth Whitening' },
    { slug: 'braces-and-orthodontics', title: 'Braces & Orthodontics' },
    { slug: 'cosmetic-dentistry', title: 'Cosmetic Dentistry' },
    { slug: 'emergency-dental-care', title: 'Emergency Dental Care' },
    { slug: 'pediatric-dentistry', title: 'Pediatric Dentistry' },
]
