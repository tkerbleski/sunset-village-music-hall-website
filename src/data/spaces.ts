// The bookable / available spaces inside Sunset Village.

export interface Space {
  id: string
  name: string
  capacity?: string
  description: string
  goodFor: string[]
  bookingType: string // preselects the inquiry form
  photo?: string
}

export const spaces: Space[] = [
  {
    id: 'music-hall',
    name: 'The Music Hall',
    capacity: 'Up to 70 people',
    description:
      'An intimate hall built for live sound. Available for private events, performances, screenings, and celebrations.',
    goodFor: ['Live music', 'Private parties', 'Screenings', 'Receptions'],
    bookingType: 'Private event — Music Hall',
  },
  {
    id: 'community-space',
    name: 'The Community Space',
    description:
      'A flexible room for the neighborhood — workshops, meetings, classes, pop-ups, and small gatherings. Submit a request and we’ll get back to you with availability.',
    goodFor: ['Workshops', 'Meetings', 'Classes', 'Pop-ups'],
    bookingType: 'Community space request',
  },
  {
    id: 'studios',
    name: 'Studios & Small Offices',
    description:
      'These spaces are still taking shape. Curious? Get in touch and we’ll keep you posted.',
    goodFor: [],
    bookingType: 'Studio / office interest',
  },
]
