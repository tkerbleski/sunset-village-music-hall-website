// Central site facts. Edit here, not in components.
// Values in [brackets] are placeholders still to be supplied by the venue;
// they render as-is so they're easy to spot. Don't invent them.

export const site = {
  name: 'Sunset Village Music Hall',
  building: 'Sunset Village',
  corner: '46th & Judah',
  tagline: 'Live music in the fog',
  neighborhood: 'Outer Sunset, San Francisco',
  address: {
    street: '4114 Judah St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94122',
  },
  url: 'https://sunsetvillagesf.com',
  directionsUrl: 'https://maps.google.com/?q=4114+Judah+St,+San+Francisco,+CA+94122',
  transit: 'N Judah to 46th Avenue. It stops right out front.',
  parking: '[Parking notes]',
  boxOffice: '[Doors and box office hours]',
  instagram: 'https://www.instagram.com/sunsetvillagesf/',
  instagramHandle: '@sunsetvillagesf',
  /** Booking inquiries. Managed by the in-house music coordinator. */
  bookingEmail: 'bookings@sunsetvillagesf.com',
  generalEmail: '[hello@sunsetvillagesf.com]',
  phone: '[(415) 000-0000]',
  leasingEmail: '[leasing@sunsetvillagesf.com]',
  room: {
    capacity: '[capacity]',
    stage: '2550 sq feet (~75 x 30)',
    sound: '[PA, monitors, house engineer]',
    extras: '[Lights, bar, green room]',
  },
  replyTime: '[X business days]',
  deposit: '[deposit]',
} as const

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`

/** True for a value that's still a [bracketed] placeholder. */
export const isPlaceholder = (v: string) => v.startsWith('[')
