// Central site facts. Edit here, not in components.

export const site = {
  name: 'Sunset Village',
  corner: '46th & Judah',
  address: {
    street: '4114 Judah St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94122',
    neighborhood: 'Outer Sunset',
  },
  directionsUrl:
    'https://maps.google.com/?q=4114+Judah+St,+San+Francisco,+CA+94122',
  transit: 'On the N Judah. Get off at 46th Avenue and you are there.',
  // Social handles and public email go here once confirmed. Leave empty
  // rather than inventing them; components hide what is missing.
  instagram: '',
  email: '',
} as const

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`
