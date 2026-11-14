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
  transit:
    'Take the N Judah westbound to 46th Avenue, one stop before the end of the line, or the 18 bus to Judah. We’re on the northwest corner.',
  parking:
    'Parking can be tricky, so take Muni if you can. Street parking turns over regularly, so be patient, and please don’t block neighbors’ driveways.',
  boxOffice: 'Shows usually run 7 to 10pm. See each show for exact times.',
  instagram: 'https://www.instagram.com/sunsetvillagesf/',
  instagramHandle: '@sunsetvillagesf',
  phone: '415-484-2101',
  room: {
    capacity: 'About 150',
    stage: '2550 sq feet (~75 x 30)',
    sound: 'PA for vocals and keys, XLR into the board, QSC K10 front monitors, house mics and stands. No backline.',
    extras: 'Projector onto the stage wall (HDMI or USB-C), and a green room for the band and VIPs.',
  },
  replyTime: 'a week',
  /** Deposit that holds a date; the rest is due on the day of the event. */
  deposit: 'half the quote',
} as const

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`

/** True for a value that's still a [bracketed] placeholder. */
export const isPlaceholder = (v: string) => v.startsWith('[')
