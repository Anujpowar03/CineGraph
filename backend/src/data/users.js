/**
 * Demo users with deliberately different (and partly overlapping) tastes so
 * every recommendation algorithm produces results that are easy to verify by
 * hand during a viva. All demo accounts share the password below.
 *
 * Interaction timestamps are generated deterministically by the seed script:
 * each user's list order is the order in which the interactions happened.
 */
export const DEMO_PASSWORD = 'Demo@1234';

export const DEMO_USERS = [
  {
    userId: 'user-aarav',
    name: 'Aarav Sharma',
    email: 'aarav@cinegraph.demo',
    persona: 'Sci-fi and Christopher Nolan fan',
    preferences: ['sci-fi', 'thriller'],
    likes: ['inception-2010', 'interstellar-2014', 'the-matrix-1999', 'arrival-2016'],
    ratings: [
      ['inception-2010', 5],
      ['interstellar-2014', 5],
      ['the-dark-knight-2008', 4],
      ['blade-runner-2049-2017', 4],
      ['tenet-2020', 3],
    ],
    watched: ['the-matrix-1999', 'inception-2010', 'the-dark-knight-2008', 'interstellar-2014', 'tenet-2020', 'blade-runner-2049-2017', 'arrival-2016'],
  },
  {
    userId: 'user-priya',
    name: 'Priya Nair',
    email: 'priya@cinegraph.demo',
    persona: 'Space epics and Denis Villeneuve',
    preferences: ['sci-fi', 'adventure', 'drama'],
    likes: ['inception-2010', 'interstellar-2014', 'arrival-2016', 'dune-2021', 'the-martian-2015', 'dune-part-two-2024'],
    ratings: [
      ['the-prestige-2006', 4],
      ['blade-runner-2049-2017', 5],
      ['edge-of-tomorrow-2014', 4],
      ['tenet-2020', 4],
    ],
    watched: ['inception-2010', 'interstellar-2014', 'arrival-2016', 'dune-2021', 'the-martian-2015', 'the-prestige-2006', 'blade-runner-2049-2017', 'edge-of-tomorrow-2014', 'tenet-2020', 'dune-part-two-2024'],
  },
  {
    userId: 'user-rohan',
    name: 'Rohan Mehta',
    email: 'rohan@cinegraph.demo',
    persona: 'Crime sagas and gangster films',
    preferences: ['crime', 'drama'],
    likes: ['the-godfather-1972', 'goodfellas-1990', 'pulp-fiction-1994', 'heat-1995', 'the-departed-2006'],
    ratings: [
      ['the-dark-knight-2008', 5],
      ['se7en-1995', 4],
      ['the-wolf-of-wall-street-2013', 3],
      ['joker-2019', 4],
    ],
    watched: ['the-godfather-1972', 'goodfellas-1990', 'pulp-fiction-1994', 'heat-1995', 'the-dark-knight-2008', 'se7en-1995', 'the-wolf-of-wall-street-2013', 'the-departed-2006', 'joker-2019'],
  },
  {
    userId: 'user-sneha',
    name: 'Sneha Iyer',
    email: 'sneha@cinegraph.demo',
    persona: 'Animation and family films',
    preferences: ['animation', 'family', 'comedy'],
    likes: ['toy-story-1995', 'finding-nemo-2003', 'spirited-away-2001', 'wall-e-2008', 'up-2009', 'inside-out-2015'],
    ratings: [
      ['my-neighbor-totoro-1988', 5],
      ['the-grand-budapest-hotel-2014', 4],
      ['spider-man-into-the-spider-verse-2018', 4],
    ],
    watched: ['toy-story-1995', 'finding-nemo-2003', 'spirited-away-2001', 'my-neighbor-totoro-1988', 'wall-e-2008', 'up-2009', 'the-grand-budapest-hotel-2014', 'inside-out-2015', 'spider-man-into-the-spider-verse-2018'],
  },
  {
    userId: 'user-kabir',
    name: 'Kabir Malhotra',
    email: 'kabir@cinegraph.demo',
    persona: 'Follows Leonardo DiCaprio’s films',
    preferences: ['drama', 'crime'],
    likes: ['titanic-1997', 'the-departed-2006', 'inception-2010', 'shutter-island-2010', 'the-wolf-of-wall-street-2013', 'the-revenant-2015'],
    ratings: [
      ['catch-me-if-you-can-2002', 5],
      ['django-unchained-2012', 4],
      ['once-upon-a-time-in-hollywood-2019', 4],
    ],
    watched: ['titanic-1997', 'catch-me-if-you-can-2002', 'the-departed-2006', 'inception-2010', 'shutter-island-2010', 'django-unchained-2012', 'the-wolf-of-wall-street-2013', 'the-revenant-2015', 'once-upon-a-time-in-hollywood-2019'],
  },
  {
    userId: 'user-meera',
    name: 'Meera Joshi',
    email: 'meera@cinegraph.demo',
    persona: 'Horror, mystery and psychological thrillers',
    preferences: ['horror', 'thriller', 'mystery'],
    likes: ['alien-1979', 'the-shining-1980', 'se7en-1995', 'prisoners-2013', 'get-out-2017'],
    ratings: [
      ['zodiac-2007', 5],
      ['gone-girl-2014', 3],
      ['a-quiet-place-2018', 4],
      ['us-2019', 4],
    ],
    watched: ['alien-1979', 'the-shining-1980', 'se7en-1995', 'zodiac-2007', 'prisoners-2013', 'gone-girl-2014', 'get-out-2017', 'a-quiet-place-2018', 'us-2019'],
  },
  {
    userId: 'user-ananya',
    name: 'Ananya Rao',
    email: 'ananya@cinegraph.demo',
    persona: 'Epic adventure and fantasy',
    preferences: ['fantasy', 'adventure', 'action'],
    likes: ['raiders-of-the-lost-ark-1981', 'jurassic-park-1993', 'gladiator-2000', 'lotr-fellowship-of-the-ring-2001', 'lotr-the-two-towers-2002', 'lotr-return-of-the-king-2003'],
    ratings: [
      ['the-dark-knight-2008', 5],
      ['avatar-2009', 3],
      ['interstellar-2014', 4],
    ],
    watched: ['raiders-of-the-lost-ark-1981', 'jurassic-park-1993', 'gladiator-2000', 'lotr-fellowship-of-the-ring-2001', 'lotr-the-two-towers-2002', 'lotr-return-of-the-king-2003', 'the-dark-knight-2008', 'avatar-2009', 'interstellar-2014'],
  },
  {
    // A brand-new account with no history: demonstrates cold-start handling.
    userId: 'user-ishaan',
    name: 'Ishaan Verma',
    email: 'ishaan@cinegraph.demo',
    persona: 'New user - no interactions yet',
    preferences: [],
    likes: [],
    ratings: [],
    watched: [],
  },
];
