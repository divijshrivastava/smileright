type EventDisplay = {
  label: string
  description: string
}

const EVENT_LABELS: Record<string, EventDisplay> = {
  page_view: {
    label: 'Page Viewed',
    description: 'A page was loaded or viewed.',
  },
  session_start: {
    label: 'Session Started',
    description: 'A new browsing session started.',
  },
  first_visit: {
    label: 'First-Time Visitor',
    description: 'A user visited the site for the first time.',
  },
  user_engagement: {
    label: 'Active Engagement',
    description: 'GA detected active engagement on page.',
  },
  scroll: {
    label: '90% Page Scroll (GA Auto)',
    description: 'User reached deep scroll on a page.',
  },
  scroll_depth: {
    label: 'Scroll Depth Milestone',
    description: 'User crossed 25/50/75/90% depth milestones.',
  },
  cta_click: {
    label: 'Primary CTA Click',
    description: 'User clicked a key call-to-action.',
  },
  book_appointment_click: {
    label: 'Book Appointment Click',
    description: 'User clicked phone/book appointment CTA.',
  },
  whatsapp_click: {
    label: 'WhatsApp Click',
    description: 'User clicked WhatsApp contact CTA.',
  },
  instagram_click: {
    label: 'Instagram Click',
    description: 'User clicked Instagram CTA.',
  },
  contact_form_submit: {
    label: 'Contact Form Submitted',
    description: 'Lead form submission completed.',
  },
  blog_click: {
    label: 'Blog Link Click',
    description: 'User clicked into a blog article.',
  },
  blog_read_progress: {
    label: 'Blog Read Progress',
    description: 'User reached blog read milestone (25/50/75/100%).',
  },
  treatment_click: {
    label: 'Treatment Link Click',
    description: 'User clicked a treatment/service page link.',
  },
  section_nav_click: {
    label: 'Section Navigation Click',
    description: 'User clicked a section anchor link.',
  },
  section_view: {
    label: 'Section Viewed',
    description: 'A home page section entered view.',
  },
  internal_link_click: {
    label: 'Internal Link Click',
    description: 'User clicked a non-CTA internal navigation link.',
  },
  location_directions_click: {
    label: 'Directions Click',
    description: 'User clicked map/directions link.',
  },
  faq_interaction: {
    label: 'FAQ Interaction',
    description: 'User expanded or interacted with FAQ.',
  },
  engaged_30s: {
    label: '30s Engaged Session',
    description: 'User remained engaged for at least 30 seconds.',
  },
}

function fallbackLabel(eventName: string) {
  return eventName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getEventDisplay(eventName: string): EventDisplay {
  return EVENT_LABELS[eventName] ?? {
    label: fallbackLabel(eventName),
    description: `Raw event key: ${eventName}`,
  }
}
