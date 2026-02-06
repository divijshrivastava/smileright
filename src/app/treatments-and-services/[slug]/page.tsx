import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'

const BASE_URL = 'https://www.smilerightdental.org'

// Treatment data with SEO-optimized content
const treatments: Record<string, {
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string
  heroSubtitle: string
  overview: string
  benefits: string[]
  process: { step: string; description: string }[]
  faqs: { question: string; answer: string }[]
  priceRange: string
  duration: string
  recovery: string
}> = {
  'dental-implants': {
    title: 'Dental Implants',
    metaTitle: 'Dental Implants in Kandivali East, Mumbai | Smile Right Dental',
    metaDescription: 'Get permanent dental implants in Kandivali East, Mumbai. Expert implant surgery by Dr. Sneha Kedia. Natural-looking tooth replacement. Book consultation: 7977991130',
    keywords: 'dental implants Mumbai, dental implants Kandivali, tooth implant cost Mumbai, best dental implant doctor, permanent teeth replacement, implant surgery Mumbai',
    heroSubtitle: 'Permanent tooth replacement that looks, feels, and functions like natural teeth',
    overview: `Dental implants are the gold standard for replacing missing teeth. Unlike dentures or bridges, implants are surgically placed into your jawbone, providing a stable foundation for replacement teeth that look and function just like your natural ones.

At Smile Right Dental Clinic, Dr. Sneha Kedia uses advanced implant techniques and high-quality titanium implants to restore your smile permanently. Whether you're missing one tooth or several, we create customized treatment plans to meet your specific needs.`,
    benefits: [
      'Look and feel like natural teeth',
      'Permanent solution - can last a lifetime with proper care',
      'Preserve jawbone and prevent bone loss',
      'No damage to adjacent healthy teeth',
      'Improved speech and eating ability',
      'Easy maintenance - brush and floss normally',
      'High success rate (over 95%)',
    ],
    process: [
      { step: 'Consultation & Planning', description: 'Comprehensive examination, X-rays, and 3D imaging to assess bone density and plan implant placement.' },
      { step: 'Implant Placement', description: 'Titanium implant post is surgically placed into the jawbone under local anesthesia.' },
      { step: 'Healing Period', description: '3-6 months for the implant to fuse with the bone (osseointegration).' },
      { step: 'Abutment Placement', description: 'Connector piece is attached to the implant to hold the crown.' },
      { step: 'Crown Fitting', description: 'Custom-made ceramic crown is attached, completing your new tooth.' },
    ],
    faqs: [
      { question: 'How much do dental implants cost in Mumbai?', answer: 'Dental implant costs in Mumbai typically range from ₹25,000 to ₹50,000 per implant, depending on the type of implant and crown. We provide transparent pricing and payment options during your consultation.' },
      { question: 'Is dental implant surgery painful?', answer: 'The procedure is performed under local anesthesia, so you won\'t feel pain during surgery. Post-operative discomfort is manageable with prescribed medications and typically subsides within a few days.' },
      { question: 'How long do dental implants last?', answer: 'With proper care and oral hygiene, dental implants can last 25 years or more - many patients keep them for life.' },
      { question: 'Am I a candidate for dental implants?', answer: 'Most adults with good general health are candidates. We\'ll assess your bone density, gum health, and overall health during consultation to determine the best approach.' },
    ],
    priceRange: '₹25,000 - ₹50,000 per implant',
    duration: '3-6 months (total treatment)',
    recovery: '1-2 weeks post-surgery',
  },
  'root-canal-treatment': {
    title: 'Root Canal Treatment',
    metaTitle: 'Painless Root Canal Treatment in Kandivali | Smile Right Dental',
    metaDescription: 'Painless root canal treatment in Kandivali East, Mumbai. Save your infected tooth with modern RCT techniques. Expert care by Dr. Sneha Kedia. Call: 7977991130',
    keywords: 'root canal treatment Mumbai, painless root canal Kandivali, RCT cost Mumbai, root canal specialist, tooth infection treatment, save infected tooth',
    heroSubtitle: 'Save your natural tooth with painless, modern root canal therapy',
    overview: `Root canal treatment (RCT) is a procedure to save a tooth that has become infected or severely decayed. The treatment involves removing the infected pulp tissue, cleaning the root canals, and sealing them to prevent future infection.

At Smile Right, we use advanced rotary endodontics and digital imaging to make root canal treatment virtually painless. Dr. Sneha Kedia's gentle approach and modern techniques ensure you're comfortable throughout the procedure.`,
    benefits: [
      'Save your natural tooth from extraction',
      'Virtually painless with modern anesthesia',
      'Stop infection from spreading',
      'Relieve severe tooth pain',
      'Restore normal biting and chewing',
      'Natural appearance with tooth-colored filling',
      'Cost-effective compared to extraction and implant',
    ],
    process: [
      { step: 'Diagnosis', description: 'X-rays and examination to assess the extent of infection and plan treatment.' },
      { step: 'Anesthesia', description: 'Local anesthesia to completely numb the area for a pain-free procedure.' },
      { step: 'Access & Cleaning', description: 'Small opening made in the tooth to access and remove infected pulp tissue.' },
      { step: 'Shaping & Disinfection', description: 'Root canals are shaped, cleaned, and disinfected with special instruments.' },
      { step: 'Filling & Sealing', description: 'Canals are filled with biocompatible material and sealed to prevent reinfection.' },
      { step: 'Crown Placement', description: 'A dental crown is recommended to protect and strengthen the treated tooth.' },
    ],
    faqs: [
      { question: 'Is root canal treatment painful?', answer: 'Modern root canal treatment is virtually painless. We use advanced anesthesia techniques to ensure you\'re completely comfortable. Most patients report it feels similar to getting a regular filling.' },
      { question: 'How much does root canal treatment cost in Mumbai?', answer: 'Root canal treatment in Mumbai typically costs ₹3,000 to ₹8,000 depending on the tooth location (front teeth are less complex than molars). Crown costs are additional.' },
      { question: 'How long does a root canal take?', answer: 'Most root canals are completed in 1-2 visits of 45-90 minutes each. Complex cases may require additional visits.' },
      { question: 'What happens if I don\'t get a root canal?', answer: 'Untreated tooth infections can spread to surrounding teeth and bone, cause severe pain and swelling, and may eventually require extraction.' },
    ],
    priceRange: '₹3,000 - ₹8,000 (excluding crown)',
    duration: '1-2 visits',
    recovery: '1-2 days',
  },
  'teeth-whitening': {
    title: 'Teeth Whitening',
    metaTitle: 'Professional Teeth Whitening in Kandivali | Smile Right Dental',
    metaDescription: 'Get brighter, whiter teeth in Kandivali East, Mumbai. Professional teeth whitening by Dr. Sneha Kedia. Safe, effective results. Book appointment: 7977991130',
    keywords: 'teeth whitening Mumbai, teeth whitening cost Kandivali, professional teeth whitening, bright smile, tooth bleaching, laser teeth whitening Mumbai',
    heroSubtitle: 'Achieve a brighter, more confident smile with professional whitening',
    overview: `Professional teeth whitening is a safe, effective way to remove stains and discoloration, giving you a noticeably brighter smile. Unlike over-the-counter products, professional whitening uses stronger, dentist-supervised treatments for better, longer-lasting results.

At Smile Right, we offer both in-office whitening for immediate results and take-home kits for gradual whitening at your convenience. Dr. Sneha Kedia will recommend the best option based on your goals and tooth sensitivity.`,
    benefits: [
      'Noticeably whiter teeth in just one visit',
      'Safe treatment supervised by dental professionals',
      'Longer-lasting results than OTC products',
      'Customized treatment for your specific needs',
      'Minimal to no sensitivity with modern techniques',
      'Boosts confidence and self-esteem',
      'Removes years of stains from coffee, tea, wine',
    ],
    process: [
      { step: 'Consultation', description: 'Examination to ensure teeth and gums are healthy for whitening treatment.' },
      { step: 'Shade Assessment', description: 'Document your current tooth shade to track improvement.' },
      { step: 'Preparation', description: 'Teeth cleaning and gum protection before whitening gel application.' },
      { step: 'Whitening Application', description: 'Professional-grade whitening gel applied and activated (with light if applicable).' },
      { step: 'Multiple Cycles', description: 'Gel is applied in 15-20 minute cycles for optimal results.' },
      { step: 'Results & Care', description: 'Final shade comparison and aftercare instructions provided.' },
    ],
    faqs: [
      { question: 'How much does teeth whitening cost in Mumbai?', answer: 'Professional teeth whitening in Mumbai costs ₹5,000 to ₹15,000 depending on the type of treatment. In-office laser whitening is at the higher end, while take-home kits are more affordable.' },
      { question: 'How long do whitening results last?', answer: 'Results typically last 6 months to 2 years depending on your diet, oral hygiene, and habits like smoking. Touch-up treatments can maintain brightness.' },
      { question: 'Does teeth whitening damage enamel?', answer: 'Professional whitening done by a dentist is safe and does not damage tooth enamel. We use controlled concentrations and monitor treatment carefully.' },
      { question: 'Will teeth whitening work on all stains?', answer: 'Whitening works best on yellow/brown stains from food, drinks, and aging. It may be less effective on gray stains or discoloration from medications. We\'ll assess your stains during consultation.' },
    ],
    priceRange: '₹5,000 - ₹15,000',
    duration: '1-2 hours (in-office)',
    recovery: 'None - immediate results',
  },
  'braces-and-orthodontics': {
    title: 'Braces & Orthodontics',
    metaTitle: 'Braces & Orthodontic Treatment in Kandivali | Smile Right Dental',
    metaDescription: 'Straighten your teeth with braces or clear aligners in Kandivali East, Mumbai. Expert orthodontic care by Dr. Sneha Kedia for children and adults. Call: 7977991130',
    keywords: 'braces Mumbai, orthodontist Kandivali, teeth straightening, Invisalign Mumbai, clear aligners, braces cost Mumbai, orthodontic treatment',
    heroSubtitle: 'Achieve a perfectly aligned smile with braces or clear aligners',
    overview: `Orthodontic treatment corrects misaligned teeth and improper bites, improving both the appearance and function of your smile. Modern orthodontics offers multiple options including traditional metal braces, ceramic braces, and clear aligners.

At Smile Right, we provide comprehensive orthodontic care for patients of all ages. Dr. Sneha Kedia creates personalized treatment plans to achieve optimal results, whether you prefer the efficiency of traditional braces or the discretion of clear aligners.`,
    benefits: [
      'Straighter, more attractive smile',
      'Improved bite and jaw alignment',
      'Easier cleaning - reduces decay and gum disease risk',
      'Better speech and chewing function',
      'Multiple options: metal, ceramic, or clear aligners',
      'Treatment available for all ages',
      'Long-lasting results with proper retention',
    ],
    process: [
      { step: 'Initial Consultation', description: 'Comprehensive exam, X-rays, and photographs to assess orthodontic needs.' },
      { step: 'Treatment Planning', description: 'Digital treatment plan showing predicted tooth movement and final results.' },
      { step: 'Appliance Fitting', description: 'Braces bonded to teeth or clear aligners custom-made for your mouth.' },
      { step: 'Regular Adjustments', description: 'Monthly visits for adjustments (braces) or new aligners every 2 weeks.' },
      { step: 'Active Treatment', description: '12-24 months of gradual tooth movement to achieve desired alignment.' },
      { step: 'Retention Phase', description: 'Retainers provided to maintain your new smile permanently.' },
    ],
    faqs: [
      { question: 'How much do braces cost in Mumbai?', answer: 'Braces in Mumbai typically cost ₹25,000 to ₹60,000 for metal braces, ₹40,000 to ₹80,000 for ceramic braces, and ₹80,000 to ₹2,50,000 for clear aligners depending on complexity.' },
      { question: 'How long does orthodontic treatment take?', answer: 'Treatment duration varies from 12-24 months depending on the complexity of your case. Some minor corrections can be completed in 6 months.' },
      { question: 'Are clear aligners as effective as braces?', answer: 'Clear aligners are highly effective for mild to moderate cases. Complex cases with severe crowding or bite issues may benefit more from traditional braces.' },
      { question: 'Is there an age limit for braces?', answer: 'There\'s no age limit for orthodontic treatment. We treat patients from children (age 7+) to adults of any age.' },
    ],
    priceRange: '₹25,000 - ₹2,50,000',
    duration: '12-24 months',
    recovery: 'Mild discomfort for a few days after adjustments',
  },
  'cosmetic-dentistry': {
    title: 'Cosmetic Dentistry',
    metaTitle: 'Cosmetic Dentistry & Smile Makeover in Kandivali | Smile Right',
    metaDescription: 'Transform your smile with cosmetic dentistry in Kandivali East, Mumbai. Veneers, bonding, smile makeovers by Dr. Sneha Kedia. Book consultation: 7977991130',
    keywords: 'cosmetic dentistry Mumbai, smile makeover Kandivali, dental veneers Mumbai, teeth bonding, smile design, aesthetic dentistry, beautiful smile',
    heroSubtitle: 'Transform your smile with advanced cosmetic dental treatments',
    overview: `Cosmetic dentistry focuses on improving the appearance of your teeth, gums, and smile. From minor fixes like teeth bonding to complete smile makeovers with veneers, these treatments can dramatically enhance your confidence and facial aesthetics.

At Smile Right, Dr. Sneha Kedia combines artistic vision with dental expertise to create beautiful, natural-looking results. We use digital smile design technology to preview your new smile before treatment begins.`,
    benefits: [
      'Dramatic improvement in smile appearance',
      'Boost self-confidence and self-esteem',
      'Natural-looking, customized results',
      'Multiple treatment options for different needs',
      'Long-lasting aesthetic improvements',
      'Can correct multiple issues in one treatment',
      'Minimal preparation for many procedures',
    ],
    process: [
      { step: 'Smile Analysis', description: 'Comprehensive evaluation of your smile, facial features, and aesthetic goals.' },
      { step: 'Digital Smile Design', description: 'Preview your new smile with digital imaging before treatment.' },
      { step: 'Treatment Planning', description: 'Customized plan combining appropriate procedures for your goals.' },
      { step: 'Preparation', description: 'Minimal tooth preparation for veneers or bonding procedures.' },
      { step: 'Restoration Placement', description: 'Veneers, crowns, or bonding material applied with precision.' },
      { step: 'Final Adjustments', description: 'Fine-tuning for perfect fit, function, and aesthetics.' },
    ],
    faqs: [
      { question: 'What cosmetic dental treatments are available?', answer: 'We offer teeth whitening, dental veneers, composite bonding, dental crowns, gum contouring, and complete smile makeovers combining multiple treatments.' },
      { question: 'How much do dental veneers cost in Mumbai?', answer: 'Dental veneers in Mumbai cost ₹8,000 to ₹25,000 per tooth depending on the material (composite vs. porcelain) and complexity.' },
      { question: 'How long do veneers last?', answer: 'Porcelain veneers typically last 10-15 years with proper care. Composite veneers last 5-7 years and can be easily repaired or replaced.' },
      { question: 'Is cosmetic dentistry covered by insurance?', answer: 'Most cosmetic procedures are considered elective and not covered by insurance. However, some treatments that also restore function may have partial coverage.' },
    ],
    priceRange: '₹3,000 - ₹25,000 per tooth',
    duration: '1-4 visits depending on treatment',
    recovery: 'Minimal to none for most procedures',
  },
  'emergency-dental-care': {
    title: 'Emergency Dental Care',
    metaTitle: 'Emergency Dentist in Kandivali East | Same Day Appointment',
    metaDescription: 'Emergency dental care in Kandivali East, Mumbai. Same-day appointments for tooth pain, broken teeth, dental trauma. Call Dr. Sneha Kedia: 7977991130',
    keywords: 'emergency dentist Mumbai, emergency dentist Kandivali, dental emergency, tooth pain relief, broken tooth repair, same day dentist, urgent dental care',
    heroSubtitle: 'Immediate care for dental emergencies - same day appointments available',
    overview: `Dental emergencies can happen anytime - severe toothache, broken tooth, knocked-out tooth, or dental trauma. Quick professional treatment is crucial to relieve pain, prevent complications, and save damaged teeth.

Smile Right provides prompt emergency dental care in Kandivali East. Dr. Sneha Kedia and the team are equipped to handle all dental emergencies with same-day appointments for urgent cases. Don't suffer in pain - call us immediately.`,
    benefits: [
      'Same-day emergency appointments',
      'Immediate pain relief',
      'Save knocked-out or broken teeth',
      'Prevent infection spread',
      'Expert handling of dental trauma',
      'After-hours availability for true emergencies',
      'Comprehensive follow-up care',
    ],
    process: [
      { step: 'Emergency Call', description: 'Call us immediately at 7977991130 - we prioritize emergency cases.' },
      { step: 'Quick Assessment', description: 'We\'ll ask about your symptoms to prepare for your visit.' },
      { step: 'Immediate Examination', description: 'Thorough exam and X-rays to diagnose the problem quickly.' },
      { step: 'Pain Management', description: 'Immediate pain relief through anesthesia and/or medication.' },
      { step: 'Emergency Treatment', description: 'Appropriate treatment based on the emergency type.' },
      { step: 'Follow-up Plan', description: 'Schedule any needed follow-up procedures and provide care instructions.' },
    ],
    faqs: [
      { question: 'What is considered a dental emergency?', answer: 'Dental emergencies include severe toothache, knocked-out tooth, broken/cracked tooth, loose tooth from injury, dental abscess (swelling with fever), and uncontrolled bleeding after extraction.' },
      { question: 'What should I do if my tooth is knocked out?', answer: 'Handle the tooth by the crown (not root), rinse gently without scrubbing, try to place it back in the socket or keep it in milk, and get to us within 30 minutes for the best chance of saving it.' },
      { question: 'How quickly can I be seen for a dental emergency?', answer: 'We offer same-day appointments for dental emergencies. Call us immediately and we\'ll fit you in as soon as possible - often within 1-2 hours.' },
      { question: 'How much does emergency dental treatment cost?', answer: 'Emergency exam and basic treatment typically costs ₹500 to ₹2,000. Additional treatment costs depend on what\'s needed (filling, extraction, root canal, etc.).' },
    ],
    priceRange: '₹500 - ₹2,000 (emergency visit)',
    duration: 'Same day treatment',
    recovery: 'Varies based on treatment',
  },
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const treatment = treatments[slug]

  if (!treatment) {
    return { title: 'Treatment Not Found | Smile Right Dental' }
  }

  return {
    title: treatment.metaTitle,
    description: treatment.metaDescription,
    keywords: treatment.keywords,
    openGraph: {
      title: treatment.title,
      description: treatment.metaDescription,
      type: 'website',
      url: `${BASE_URL}/treatments-and-services/${slug}`,
    },
    alternates: {
      canonical: `${BASE_URL}/treatments-and-services/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(treatments).map((slug) => ({ slug }))
}

export default async function TreatmentPage({ params }: Props) {
  const { slug } = await params
  const treatment = treatments[slug]

  if (!treatment) {
    notFound()
  }

  // Service schema for this treatment
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: treatment.title,
    description: treatment.overview.split('\n')[0],
    procedureType: 'https://schema.org/NoninvasiveProcedure',
    provider: {
      '@type': 'Dentist',
      name: 'Smile Right - Multispecialty Dental Clinic & Implant Centre',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Shop No. 31, Gokul Nagar 2, CDE Wing, Opp. Gokul Concorde, Thakur Village',
        addressLocality: 'Kandivali East',
        addressRegion: 'Mumbai',
        postalCode: '400101',
        addressCountry: 'IN',
      },
      telephone: '+91-7977991130',
    },
  }

  // FAQ schema for this treatment
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: treatment.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Treatments & Services',
        item: `${BASE_URL}/treatments-and-services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: treatment.title,
        item: `${BASE_URL}/treatments-and-services/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FloatingWhatsApp />
      <Header />

      <main className="treatment-detail-page">
        {/* Hero Section */}
        <section className="treatment-hero">
          <div className="container">
            <nav className="breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/treatments-and-services">Treatments & Services</Link>
              <span>/</span>
              <span>{treatment.title}</span>
            </nav>
            <h1>{treatment.title}</h1>
            <p>{treatment.heroSubtitle}</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-label">Typical Cost</span>
                <span className="stat-value">{treatment.priceRange}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Duration</span>
                <span className="stat-value">{treatment.duration}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Recovery</span>
                <span className="stat-value">{treatment.recovery}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="treatment-overview">
          <div className="container">
            <h2>Overview</h2>
            {treatment.overview.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="treatment-benefits">
          <div className="container">
            <h2>Benefits</h2>
            <ul className="benefits-list">
              {treatment.benefits.map((benefit, index) => (
                <li key={index}>
                  <span className="benefit-icon">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Process Section */}
        <section className="treatment-process">
          <div className="container">
            <h2>Treatment Process</h2>
            <div className="process-steps">
              {treatment.process.map((step, index) => (
                <div key={index} className="process-step">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <h3>{step.step}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="treatment-faq">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {treatment.faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="treatment-cta">
          <div className="container">
            <h2>Ready to Get Started?</h2>
            <p>Book a consultation with Dr. Sneha Kedia to discuss your {treatment.title.toLowerCase()} options.</p>
            <div className="cta-buttons">
              <a href="tel:+917977991130" className="btn btn-primary">
                📞 Call: 7977 991 130
              </a>
              <a
                href={`https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20know%20more%20about%20${encodeURIComponent(treatment.title)}`}
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
