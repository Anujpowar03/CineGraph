/**
 * CineGraph curated sample catalogue
 * ----------------------------------
 * 80 well-known feature films chosen so that genres, actors and directors
 * overlap heavily - exactly what a graph recommender needs to demonstrate.
 *
 * Data notes (please read before reusing this data):
 * - Titles, release years, directors and principal cast are public facts.
 * - `runtime` (minutes) and `rating` (0-10 audience score) are APPROXIMATE
 *   values included as sample metadata for this educational project. They are
 *   not an official feed from IMDb, TMDB or any other provider.
 * - `overview` texts are short original summaries written for this project.
 * - `cast` lists a few principal actors in billing order, not the full cast.
 * - Posters are not bundled. The UI draws generated artwork, or real posters
 *   if you opt in to the TMDB sync script (see README).
 */
export const MOVIES = [
  // --- Christopher Nolan ------------------------------------------------------
  {
    id: 'inception-2010', posterPath: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg', title: 'Inception', year: 2010, runtime: 148, rating: 8.8,
    genres: ['sci-fi', 'action', 'thriller'], directors: ['Christopher Nolan'],
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy', 'Cillian Murphy', 'Michael Caine'],
    overview: 'A thief who steals secrets from inside dreams is offered one last job: planting an idea in a target’s mind instead of taking one out.',
  },
  {
    id: 'the-dark-knight-2008', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg', title: 'The Dark Knight', year: 2008, runtime: 152, rating: 9.0,
    genres: ['action', 'crime', 'drama'], directors: ['Christopher Nolan'],
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Gary Oldman'],
    overview: 'Batman, Commissioner Gordon and District Attorney Harvey Dent face the Joker, a criminal who wants to prove that anyone can be pushed into chaos.',
  },
  {
    id: 'interstellar-2014', posterPath: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg', title: 'Interstellar', year: 2014, runtime: 169, rating: 8.7,
    genres: ['sci-fi', 'adventure', 'drama'], directors: ['Christopher Nolan'],
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine', 'Matt Damon'],
    overview: 'With Earth’s crops failing, a former pilot leads an expedition through a wormhole to search for a new home for humanity.',
  },
  {
    id: 'the-prestige-2006', posterPath: 'https://upload.wikimedia.org/wikipedia/en/d/d2/Prestige_poster.jpg', title: 'The Prestige', year: 2006, runtime: 130, rating: 8.5,
    genres: ['drama', 'mystery', 'thriller'], directors: ['Christopher Nolan'],
    cast: ['Christian Bale', 'Hugh Jackman', 'Scarlett Johansson', 'Michael Caine'],
    overview: 'Two rival stage magicians in Victorian London escalate their feud in pursuit of the perfect illusion, whatever the cost.',
  },
  {
    id: 'memento-2000', posterPath: 'https://upload.wikimedia.org/wikipedia/en/c/c7/Memento_poster.jpg', title: 'Memento', year: 2000, runtime: 113, rating: 8.4,
    genres: ['mystery', 'thriller'], directors: ['Christopher Nolan'],
    cast: ['Guy Pearce', 'Carrie-Anne Moss', 'Joe Pantoliano'],
    overview: 'A man unable to form new memories hunts for his wife’s killer using notes, photographs and tattoos, told in reverse order.',
  },
  {
    id: 'dunkirk-2017', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/15/Dunkirk_Film_poster.jpg', title: 'Dunkirk', year: 2017, runtime: 106, rating: 7.8,
    genres: ['war', 'history', 'drama'], directors: ['Christopher Nolan'],
    cast: ['Fionn Whitehead', 'Tom Hardy', 'Kenneth Branagh', 'Cillian Murphy'],
    overview: 'Soldiers, pilots and civilian sailors race against time during the 1940 evacuation of Allied troops from the beaches of Dunkirk.',
  },
  {
    id: 'oppenheimer-2023', posterPath: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg', title: 'Oppenheimer', year: 2023, runtime: 180, rating: 8.3,
    genres: ['drama', 'history'], directors: ['Christopher Nolan'],
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    overview: 'The story of physicist J. Robert Oppenheimer, the Manhattan Project and the moral weight of creating the atomic bomb.',
  },
  {
    id: 'tenet-2020', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/14/Tenet_movie_poster.jpg', title: 'Tenet', year: 2020, runtime: 150, rating: 7.3,
    genres: ['sci-fi', 'action', 'thriller'], directors: ['Christopher Nolan'],
    cast: ['John David Washington', 'Robert Pattinson', 'Elizabeth Debicki', 'Kenneth Branagh'],
    overview: 'A secret agent learns to manipulate the flow of time to prevent an attack that could end the world.',
  },
  {
    id: 'batman-begins-2005', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/af/Batman_Begins_Poster.jpg', title: 'Batman Begins', year: 2005, runtime: 140, rating: 8.2,
    genres: ['action', 'crime', 'adventure'], directors: ['Christopher Nolan'],
    cast: ['Christian Bale', 'Michael Caine', 'Liam Neeson', 'Cillian Murphy', 'Gary Oldman'],
    overview: 'After years of training abroad, Bruce Wayne returns to a corrupt Gotham City and becomes the vigilante Batman.',
  },
  {
    id: 'the-dark-knight-rises-2012', posterPath: 'https://upload.wikimedia.org/wikipedia/en/8/83/Dark_knight_rises_poster.jpg', title: 'The Dark Knight Rises', year: 2012, runtime: 164, rating: 8.4,
    genres: ['action', 'crime', 'drama'], directors: ['Christopher Nolan'],
    cast: ['Christian Bale', 'Tom Hardy', 'Anne Hathaway', 'Joseph Gordon-Levitt', 'Gary Oldman'],
    overview: 'Eight years after Harvey Dent’s death, a retired Batman must return when the masked revolutionary Bane takes Gotham hostage.',
  },

  // --- Denis Villeneuve -------------------------------------------------------
  {
    id: 'arrival-2016', posterPath: 'https://upload.wikimedia.org/wikipedia/en/d/df/Arrival%2C_Movie_Poster.jpg', title: 'Arrival', year: 2016, runtime: 116, rating: 7.9,
    genres: ['sci-fi', 'drama', 'mystery'], directors: ['Denis Villeneuve'],
    cast: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker'],
    overview: 'A linguist is recruited to communicate with mysterious visitors whose ships have landed around the world.',
  },
  {
    id: 'blade-runner-2049-2017', posterPath: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Blade_Runner_2049_poster.png', title: 'Blade Runner 2049', year: 2017, runtime: 164, rating: 8.0,
    genres: ['sci-fi', 'drama', 'mystery'], directors: ['Denis Villeneuve'],
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
    overview: 'A replicant blade runner uncovers a buried secret that leads him to search for a long-missing former blade runner.',
  },
  {
    id: 'dune-2021', posterPath: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg', title: 'Dune', year: 2021, runtime: 155, rating: 8.0,
    genres: ['sci-fi', 'adventure', 'drama'], directors: ['Denis Villeneuve'],
    cast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac', 'Zendaya', 'Josh Brolin'],
    overview: 'The heir of a noble house travels to the desert planet Arrakis, the only source of the universe’s most valuable substance.',
  },
  {
    id: 'dune-part-two-2024', posterPath: 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg', title: 'Dune: Part Two', year: 2024, runtime: 166, rating: 8.5,
    genres: ['sci-fi', 'adventure', 'action'], directors: ['Denis Villeneuve'],
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler', 'Josh Brolin'],
    overview: 'Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family, while fearing the future he foresees.',
  },
  {
    id: 'prisoners-2013', posterPath: 'https://upload.wikimedia.org/wikipedia/en/6/63/Prisoners2013Poster.jpg', title: 'Prisoners', year: 2013, runtime: 153, rating: 8.1,
    genres: ['crime', 'drama', 'thriller', 'mystery'], directors: ['Denis Villeneuve'],
    cast: ['Hugh Jackman', 'Jake Gyllenhaal', 'Viola Davis'],
    overview: 'When two young girls go missing, a desperate father takes matters into his own hands while a detective follows the evidence.',
  },
  {
    id: 'sicario-2015', posterPath: 'https://upload.wikimedia.org/wikipedia/en/4/4b/Sicario_poster.jpg', title: 'Sicario', year: 2015, runtime: 121, rating: 7.6,
    genres: ['action', 'crime', 'thriller'], directors: ['Denis Villeneuve'],
    cast: ['Emily Blunt', 'Benicio del Toro', 'Josh Brolin'],
    overview: 'An idealistic FBI agent joins a covert task force fighting a drug cartel along the US–Mexico border.',
  },

  // --- Ridley Scott -----------------------------------------------------------
  {
    id: 'blade-runner-1982', posterPath: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Blade_Runner_%281982_poster%29.png', title: 'Blade Runner', year: 1982, runtime: 117, rating: 8.1,
    genres: ['sci-fi', 'thriller'], directors: ['Ridley Scott'],
    cast: ['Harrison Ford', 'Rutger Hauer', 'Sean Young'],
    overview: 'In a rain-soaked future Los Angeles, a weary blade runner hunts a group of escaped synthetic humans.',
  },
  {
    id: 'alien-1979', posterPath: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Alien_movie_poster.jpg', title: 'Alien', year: 1979, runtime: 117, rating: 8.5,
    genres: ['horror', 'sci-fi'], directors: ['Ridley Scott'],
    cast: ['Sigourney Weaver', 'Tom Skerritt', 'John Hurt'],
    overview: 'The crew of a commercial spaceship answers a distress signal and brings a deadly creature aboard.',
  },
  {
    id: 'gladiator-2000', posterPath: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Gladiator_%282000_film_poster%29.png', title: 'Gladiator', year: 2000, runtime: 155, rating: 8.5,
    genres: ['action', 'adventure', 'drama'], directors: ['Ridley Scott'],
    cast: ['Russell Crowe', 'Joaquin Phoenix', 'Connie Nielsen'],
    overview: 'A betrayed Roman general is sold into slavery and rises through the arena to confront the emperor who murdered his family.',
  },
  {
    id: 'the-martian-2015', posterPath: 'https://upload.wikimedia.org/wikipedia/en/c/cd/The_Martian_film_poster.jpg', title: 'The Martian', year: 2015, runtime: 144, rating: 8.0,
    genres: ['sci-fi', 'adventure', 'drama'], directors: ['Ridley Scott'],
    cast: ['Matt Damon', 'Jessica Chastain', 'Kristen Wiig'],
    overview: 'Stranded alone on Mars, an astronaut uses science and stubborn humour to survive until rescue is possible.',
  },

  // --- James Cameron ----------------------------------------------------------
  {
    id: 'aliens-1986', posterPath: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Aliens_poster.jpg', title: 'Aliens', year: 1986, runtime: 137, rating: 8.4,
    genres: ['action', 'sci-fi', 'horror'], directors: ['James Cameron'],
    cast: ['Sigourney Weaver', 'Michael Biehn', 'Bill Paxton'],
    overview: 'Ripley returns to the moon where her crew found the alien, this time accompanied by a unit of colonial marines.',
  },
  {
    id: 'terminator-2-1991', posterPath: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Terminator_2-Judgment_Day.png', title: 'Terminator 2: Judgment Day', year: 1991, runtime: 137, rating: 8.6,
    genres: ['action', 'sci-fi'], directors: ['James Cameron'],
    cast: ['Arnold Schwarzenegger', 'Linda Hamilton', 'Edward Furlong'],
    overview: 'A reprogrammed cyborg is sent back in time to protect a teenage boy from a far more advanced liquid-metal assassin.',
  },
  {
    id: 'titanic-1997', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png', title: 'Titanic', year: 1997, runtime: 194, rating: 7.9,
    genres: ['drama', 'romance'], directors: ['James Cameron'],
    cast: ['Leonardo DiCaprio', 'Kate Winslet', 'Billy Zane'],
    overview: 'A penniless artist and a young aristocrat fall in love aboard the ill-fated maiden voyage of RMS Titanic.',
  },
  {
    id: 'avatar-2009', posterPath: 'https://upload.wikimedia.org/wikipedia/en/d/d6/Avatar_%282009_film%29_poster.jpg', title: 'Avatar', year: 2009, runtime: 162, rating: 7.9,
    genres: ['sci-fi', 'adventure', 'action'], directors: ['James Cameron'],
    cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver'],
    overview: 'A paraplegic marine controls a native-alien body on Pandora and finds himself torn between his mission and the Na’vi.',
  },

  // --- Steven Spielberg -------------------------------------------------------
  {
    id: 'jurassic-park-1993', posterPath: 'https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg', title: 'Jurassic Park', year: 1993, runtime: 127, rating: 8.2,
    genres: ['adventure', 'sci-fi', 'action'], directors: ['Steven Spielberg'],
    cast: ['Sam Neill', 'Laura Dern', 'Jeff Goldblum'],
    overview: 'Experts touring an island theme park of cloned dinosaurs are trapped when the park’s systems fail.',
  },
  {
    id: 'saving-private-ryan-1998', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/ac/Saving_Private_Ryan_poster.jpg', title: 'Saving Private Ryan', year: 1998, runtime: 169, rating: 8.6,
    genres: ['war', 'drama'], directors: ['Steven Spielberg'],
    cast: ['Tom Hanks', 'Matt Damon', 'Tom Sizemore'],
    overview: 'After the D-Day landings, a squad of soldiers is sent behind enemy lines to find a paratrooper whose brothers have died.',
  },
  {
    id: 'catch-me-if-you-can-2002', posterPath: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Catch_Me_If_You_Can_2002_movie.jpg', title: 'Catch Me If You Can', year: 2002, runtime: 141, rating: 8.1,
    genres: ['crime', 'drama', 'comedy'], directors: ['Steven Spielberg'],
    cast: ['Leonardo DiCaprio', 'Tom Hanks', 'Christopher Walken'],
    overview: 'A teenage con artist poses as a pilot, doctor and lawyer while an FBI agent chases him across the country.',
  },
  {
    id: 'raiders-of-the-lost-ark-1981', posterPath: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Raiders_soundtrack.jpg', title: 'Raiders of the Lost Ark', year: 1981, runtime: 115, rating: 8.4,
    genres: ['action', 'adventure'], directors: ['Steven Spielberg'],
    cast: ['Harrison Ford', 'Karen Allen', 'Paul Freeman'],
    overview: 'Archaeologist Indiana Jones races to find the Ark of the Covenant before it falls into the wrong hands.',
  },
  {
    id: 'schindlers-list-1993', posterPath: 'https://upload.wikimedia.org/wikipedia/en/3/38/Schindler%27s_List_movie.jpg', title: 'Schindler’s List', year: 1993, runtime: 195, rating: 9.0,
    genres: ['drama', 'history', 'war'], directors: ['Steven Spielberg'],
    cast: ['Liam Neeson', 'Ben Kingsley', 'Ralph Fiennes'],
    overview: 'A German industrialist gradually risks everything to save more than a thousand Jewish workers during the Holocaust.',
  },

  // --- Martin Scorsese --------------------------------------------------------
  {
    id: 'the-departed-2006', posterPath: 'https://upload.wikimedia.org/wikipedia/en/5/50/Departed234.jpg', title: 'The Departed', year: 2006, runtime: 151, rating: 8.5,
    genres: ['crime', 'drama', 'thriller'], directors: ['Martin Scorsese'],
    cast: ['Leonardo DiCaprio', 'Matt Damon', 'Jack Nicholson', 'Mark Wahlberg'],
    overview: 'An undercover cop inside a Boston gang and a gang mole inside the police race to expose each other.',
  },
  {
    id: 'shutter-island-2010', posterPath: 'https://upload.wikimedia.org/wikipedia/en/7/76/Shutterislandposter.jpg', title: 'Shutter Island', year: 2010, runtime: 138, rating: 8.2,
    genres: ['mystery', 'thriller'], directors: ['Martin Scorsese'],
    cast: ['Leonardo DiCaprio', 'Mark Ruffalo', 'Ben Kingsley'],
    overview: 'Two US marshals investigate the disappearance of a patient from a hospital for the criminally insane on a remote island.',
  },
  {
    id: 'the-wolf-of-wall-street-2013', posterPath: 'https://upload.wikimedia.org/wikipedia/en/d/d8/The_Wolf_of_Wall_Street_%282013%29.png', title: 'The Wolf of Wall Street', year: 2013, runtime: 180, rating: 8.2,
    genres: ['comedy', 'crime', 'drama'], directors: ['Martin Scorsese'],
    cast: ['Leonardo DiCaprio', 'Jonah Hill', 'Margot Robbie'],
    overview: 'The rise and fall of a stockbroker whose firm’s fraud and excess draw the attention of federal investigators.',
  },
  {
    id: 'goodfellas-1990', posterPath: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Goodfellas.jpg', title: 'Goodfellas', year: 1990, runtime: 145, rating: 8.7,
    genres: ['crime', 'drama'], directors: ['Martin Scorsese'],
    cast: ['Robert De Niro', 'Ray Liotta', 'Joe Pesci'],
    overview: 'Henry Hill’s life inside the New York mob, from teenage errand boy to informant, across three decades.',
  },

  // --- David Fincher ----------------------------------------------------------
  {
    id: 'fight-club-1999', posterPath: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg', title: 'Fight Club', year: 1999, runtime: 139, rating: 8.8,
    genres: ['drama', 'thriller'], directors: ['David Fincher'],
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    overview: 'An insomniac office worker and a reckless soap salesman start an underground fight club that grows into something darker.',
  },
  {
    id: 'se7en-1995', posterPath: 'https://upload.wikimedia.org/wikipedia/en/6/68/Seven_%28movie%29_poster.jpg', title: 'Se7en', year: 1995, runtime: 127, rating: 8.6,
    genres: ['crime', 'mystery', 'thriller'], directors: ['David Fincher'],
    cast: ['Brad Pitt', 'Morgan Freeman', 'Gwyneth Paltrow'],
    overview: 'Two detectives track a serial killer who builds each murder around one of the seven deadly sins.',
  },
  {
    id: 'gone-girl-2014', posterPath: 'https://upload.wikimedia.org/wikipedia/en/0/05/Gone_Girl_Poster.jpg', title: 'Gone Girl', year: 2014, runtime: 149, rating: 8.1,
    genres: ['drama', 'mystery', 'thriller'], directors: ['David Fincher'],
    cast: ['Ben Affleck', 'Rosamund Pike', 'Neil Patrick Harris'],
    overview: 'When his wife disappears on their anniversary, a husband becomes the focus of a media frenzy and police suspicion.',
  },
  {
    id: 'the-social-network-2010', posterPath: 'https://upload.wikimedia.org/wikipedia/en/8/8c/The_Social_Network_film_poster.png', title: 'The Social Network', year: 2010, runtime: 120, rating: 7.8,
    genres: ['drama'], directors: ['David Fincher'],
    cast: ['Jesse Eisenberg', 'Andrew Garfield', 'Justin Timberlake'],
    overview: 'The founding of Facebook and the lawsuits that followed, told through the friendships it broke.',
  },
  {
    id: 'zodiac-2007', posterPath: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Zodiac2007Poster.jpg', title: 'Zodiac', year: 2007, runtime: 157, rating: 7.7,
    genres: ['crime', 'drama', 'mystery'], directors: ['David Fincher'],
    cast: ['Jake Gyllenhaal', 'Mark Ruffalo', 'Robert Downey Jr.'],
    overview: 'A cartoonist, a detective and a reporter become obsessed with identifying the Zodiac killer in 1970s San Francisco.',
  },

  // --- Quentin Tarantino ------------------------------------------------------
  {
    id: 'pulp-fiction-1994', posterPath: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg', title: 'Pulp Fiction', year: 1994, runtime: 154, rating: 8.9,
    genres: ['crime', 'drama'], directors: ['Quentin Tarantino'],
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis'],
    overview: 'The intertwined stories of two hitmen, a boxer, a gangster’s wife and a pair of diner robbers in Los Angeles.',
  },
  {
    id: 'django-unchained-2012', posterPath: 'https://upload.wikimedia.org/wikipedia/en/8/8b/Django_Unchained_Poster.jpg', title: 'Django Unchained', year: 2012, runtime: 165, rating: 8.5,
    genres: ['drama', 'action'], directors: ['Quentin Tarantino'],
    cast: ['Jamie Foxx', 'Christoph Waltz', 'Leonardo DiCaprio', 'Samuel L. Jackson'],
    overview: 'A freed slave teams up with a bounty hunter to rescue his wife from a brutal Mississippi plantation owner.',
  },
  {
    id: 'inglourious-basterds-2009', posterPath: 'https://upload.wikimedia.org/wikipedia/en/2/28/IBSoundtrackcover.jpg', title: 'Inglourious Basterds', year: 2009, runtime: 153, rating: 8.4,
    genres: ['adventure', 'drama', 'war'], directors: ['Quentin Tarantino'],
    cast: ['Brad Pitt', 'Christoph Waltz', 'Mélanie Laurent'],
    overview: 'In occupied France, a band of Allied soldiers and a vengeful cinema owner plot separate attacks on the Nazi leadership.',
  },
  {
    id: 'once-upon-a-time-in-hollywood-2019', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/a6/Once_Upon_a_Time_in_Hollywood_poster.png', title: 'Once Upon a Time in Hollywood', year: 2019, runtime: 161, rating: 7.6,
    genres: ['comedy', 'drama'], directors: ['Quentin Tarantino'],
    cast: ['Leonardo DiCaprio', 'Brad Pitt', 'Margot Robbie'],
    overview: 'A fading TV actor and his stunt double navigate a changing film industry in 1969 Los Angeles.',
  },
  {
    id: 'kill-bill-vol-1-2003', posterPath: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Soundtrack_-Kill_Bill_Volume_1-.jpg', title: 'Kill Bill: Vol. 1', year: 2003, runtime: 111, rating: 8.2,
    genres: ['action', 'crime', 'thriller'], directors: ['Quentin Tarantino'],
    cast: ['Uma Thurman', 'Lucy Liu', 'Vivica A. Fox'],
    overview: 'An assassin wakes from a coma and sets out to take revenge on the team that betrayed her.',
  },

  // --- Science fiction & action classics -------------------------------------
  {
    id: 'the-matrix-1999', posterPath: 'https://upload.wikimedia.org/wikipedia/en/d/db/The_Matrix.png', title: 'The Matrix', year: 1999, runtime: 136, rating: 8.7,
    genres: ['action', 'sci-fi'], directors: ['Lana Wachowski', 'Lilly Wachowski'],
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    overview: 'A hacker learns that the world he knows is a simulation and joins a rebellion against the machines that built it.',
  },
  {
    id: 'mad-max-fury-road-2015', posterPath: 'https://upload.wikimedia.org/wikipedia/en/6/6e/Mad_Max_Fury_Road.jpg', title: 'Mad Max: Fury Road', year: 2015, runtime: 120, rating: 8.1,
    genres: ['action', 'adventure', 'sci-fi'], directors: ['George Miller'],
    cast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult'],
    overview: 'In a post-apocalyptic wasteland, a drifter and a rebel commander flee a tyrant in a heavily armed war rig.',
  },
  {
    id: 'edge-of-tomorrow-2014', posterPath: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Edge_of_Tomorrow_Poster.jpg', title: 'Edge of Tomorrow', year: 2014, runtime: 113, rating: 7.9,
    genres: ['action', 'sci-fi'], directors: ['Doug Liman'],
    cast: ['Tom Cruise', 'Emily Blunt', 'Bill Paxton'],
    overview: 'An inexperienced officer caught in a time loop relives the same battle against alien invaders, improving each time.',
  },
  {
    id: 'mission-impossible-fallout-2018', posterPath: 'https://upload.wikimedia.org/wikipedia/en/f/ff/MI_%E2%80%93_Fallout.jpg', title: 'Mission: Impossible – Fallout', year: 2018, runtime: 147, rating: 7.7,
    genres: ['action', 'adventure', 'thriller'], directors: ['Christopher McQuarrie'],
    cast: ['Tom Cruise', 'Henry Cavill', 'Rebecca Ferguson'],
    overview: 'Ethan Hunt and his team race to recover stolen plutonium after a mission goes wrong.',
  },
  {
    id: 'top-gun-maverick-2022', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/13/Top_Gun_Maverick_Poster.jpg', title: 'Top Gun: Maverick', year: 2022, runtime: 130, rating: 8.2,
    genres: ['action', 'drama'], directors: ['Joseph Kosinski'],
    cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
    overview: 'A veteran naval aviator returns to train a group of young pilots for a dangerous mission.',
  },
  {
    id: 'everything-everywhere-all-at-once-2022', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/1e/Everything_Everywhere_All_at_Once.jpg', title: 'Everything Everywhere All at Once', year: 2022, runtime: 139, rating: 7.8,
    genres: ['action', 'adventure', 'comedy', 'sci-fi'], directors: ['Daniel Kwan', 'Daniel Scheinert'],
    cast: ['Michelle Yeoh', 'Ke Huy Quan', 'Jamie Lee Curtis'],
    overview: 'An overwhelmed laundromat owner discovers she must connect with versions of herself in parallel universes to save them all.',
  },
  {
    id: '2001-a-space-odyssey-1968', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/11/2001_A_Space_Odyssey_%281968%29.png', title: '2001: A Space Odyssey', year: 1968, runtime: 149, rating: 8.3,
    genres: ['sci-fi', 'adventure'], directors: ['Stanley Kubrick'],
    cast: ['Keir Dullea', 'Gary Lockwood', 'William Sylvester'],
    overview: 'A mysterious black monolith guides human evolution, and a mission to Jupiter is put at risk by its own computer.',
  },
  {
    id: 'back-to-the-future-1985', posterPath: 'https://upload.wikimedia.org/wikipedia/en/d/d2/Back_to_the_Future.jpg', title: 'Back to the Future', year: 1985, runtime: 116, rating: 8.5,
    genres: ['adventure', 'comedy', 'sci-fi'], directors: ['Robert Zemeckis'],
    cast: ['Michael J. Fox', 'Christopher Lloyd', 'Lea Thompson'],
    overview: 'A teenager is accidentally sent thirty years into the past in a time-travelling DeLorean and must make sure his parents fall in love.',
  },

  // --- Animation & family -----------------------------------------------------
  {
    id: 'toy-story-1995', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg', title: 'Toy Story', year: 1995, runtime: 81, rating: 8.3,
    genres: ['animation', 'adventure', 'comedy', 'family'], directors: ['John Lasseter'],
    cast: ['Tom Hanks', 'Tim Allen', 'Don Rickles'],
    overview: 'A cowboy doll feels threatened when a flashy space-ranger action figure becomes his owner’s new favourite toy.',
  },
  {
    id: 'up-2009', posterPath: 'https://upload.wikimedia.org/wikipedia/en/0/05/Up_%282009_film%29.jpg', title: 'Up', year: 2009, runtime: 96, rating: 8.3,
    genres: ['animation', 'adventure', 'comedy', 'family'], directors: ['Pete Docter', 'Bob Peterson'],
    cast: ['Ed Asner', 'Christopher Plummer', 'Jordan Nagai'],
    overview: 'A widowed balloon salesman ties thousands of balloons to his house and flies to South America, with a young scout accidentally aboard.',
  },
  {
    id: 'inside-out-2015', posterPath: 'https://upload.wikimedia.org/wikipedia/en/0/0a/Inside_Out_%282015_film%29_poster.jpg', title: 'Inside Out', year: 2015, runtime: 95, rating: 8.1,
    genres: ['animation', 'adventure', 'comedy', 'family'], directors: ['Pete Docter', 'Ronnie del Carmen'],
    cast: ['Amy Poehler', 'Phyllis Smith', 'Bill Hader'],
    overview: 'The emotions inside an eleven-year-old girl’s mind struggle to guide her through a difficult move to a new city.',
  },
  {
    id: 'wall-e-2008', posterPath: 'https://upload.wikimedia.org/wikipedia/en/4/4c/WALL-E_poster.jpg', title: 'WALL·E', year: 2008, runtime: 98, rating: 8.4,
    genres: ['animation', 'adventure', 'sci-fi', 'family'], directors: ['Andrew Stanton'],
    cast: ['Ben Burtt', 'Elissa Knight', 'Jeff Garlin'],
    overview: 'A lonely waste-collecting robot left on an abandoned Earth follows a sleek probe robot into space.',
  },
  {
    id: 'finding-nemo-2003', posterPath: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Finding_Nemo_logo.svg/330px-Finding_Nemo_logo.svg.png', title: 'Finding Nemo', year: 2003, runtime: 100, rating: 8.2,
    genres: ['animation', 'adventure', 'comedy', 'family'], directors: ['Andrew Stanton', 'Lee Unkrich'],
    cast: ['Albert Brooks', 'Ellen DeGeneres', 'Alexander Gould'],
    overview: 'An overprotective clownfish crosses the ocean, helped by a forgetful blue tang, to find his captured son.',
  },
  {
    id: 'spirited-away-2001', posterPath: 'https://upload.wikimedia.org/wikipedia/en/d/db/Spirited_Away_Japanese_poster.png', title: 'Spirited Away', year: 2001, runtime: 125, rating: 8.6,
    genres: ['animation', 'adventure', 'fantasy', 'family'], directors: ['Hayao Miyazaki'],
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    overview: 'A girl trapped in a world of spirits works in a bathhouse for gods to free herself and her transformed parents.',
  },
  {
    id: 'my-neighbor-totoro-1988', posterPath: 'https://upload.wikimedia.org/wikipedia/en/0/02/My_Neighbor_Totoro_-_Tonari_no_Totoro_%28Movie_Poster%29.jpg', title: 'My Neighbor Totoro', year: 1988, runtime: 86, rating: 8.1,
    genres: ['animation', 'fantasy', 'family'], directors: ['Hayao Miyazaki'],
    cast: ['Noriko Hidaka', 'Chika Sakamoto', 'Shigesato Itoi'],
    overview: 'Two sisters who move to the countryside befriend the gentle forest spirits living nearby.',
  },
  {
    id: 'spider-man-into-the-spider-verse-2018', posterPath: 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/a0/Spider-Man_Beyond_the_Spider-Verse_logo.jpg/330px-Spider-Man_Beyond_the_Spider-Verse_logo.jpg', title: 'Spider-Man: Into the Spider-Verse', year: 2018, runtime: 117, rating: 8.4,
    genres: ['animation', 'action', 'adventure'], directors: ['Bob Persichetti', 'Peter Ramsey', 'Rodney Rothman'],
    cast: ['Shameik Moore', 'Jake Johnson', 'Hailee Steinfeld'],
    overview: 'Brooklyn teenager Miles Morales becomes Spider-Man and meets spider-heroes from other dimensions.',
  },

  // --- Fantasy epics ----------------------------------------------------------
  {
    id: 'lotr-fellowship-of-the-ring-2001', posterPath: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Lord_Rings_Fellowship_Ring.jpg', title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, runtime: 178, rating: 8.9,
    genres: ['adventure', 'fantasy', 'action'], directors: ['Peter Jackson'],
    cast: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen', 'Sean Astin'],
    overview: 'A hobbit inherits a powerful ring and sets out with eight companions to destroy it.',
  },
  {
    id: 'lotr-the-two-towers-2002', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/a1/Lord_Rings_Two_Towers.jpg', title: 'The Lord of the Rings: The Two Towers', year: 2002, runtime: 179, rating: 8.8,
    genres: ['adventure', 'fantasy', 'action'], directors: ['Peter Jackson'],
    cast: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen', 'Sean Astin'],
    overview: 'The broken fellowship fights on separate fronts as Frodo and Sam continue towards Mordor.',
  },
  {
    id: 'lotr-return-of-the-king-2003', posterPath: 'https://upload.wikimedia.org/wikipedia/en/4/48/Lord_Rings_Return_King.jpg', title: 'The Lord of the Rings: The Return of the King', year: 2003, runtime: 201, rating: 9.0,
    genres: ['adventure', 'fantasy', 'action'], directors: ['Peter Jackson'],
    cast: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen', 'Sean Astin'],
    overview: 'The final battle for Middle-earth begins as Frodo and Sam approach Mount Doom.',
  },

  // --- Drama, romance & comedy ------------------------------------------------
  {
    id: 'la-la-land-2016', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png', title: 'La La Land', year: 2016, runtime: 128, rating: 8.0,
    genres: ['comedy', 'drama', 'romance'], directors: ['Damien Chazelle'],
    cast: ['Ryan Gosling', 'Emma Stone', 'John Legend'],
    overview: 'A jazz pianist and an aspiring actress fall in love in Los Angeles while chasing their ambitions.',
  },
  {
    id: 'whiplash-2014', posterPath: 'https://upload.wikimedia.org/wikipedia/en/0/01/Whiplash_poster.jpg', title: 'Whiplash', year: 2014, runtime: 106, rating: 8.5,
    genres: ['drama'], directors: ['Damien Chazelle'],
    cast: ['Miles Teller', 'J.K. Simmons', 'Paul Reiser'],
    overview: 'A young drummer at an elite music school is pushed to his limits by a ruthless instructor.',
  },
  {
    id: 'the-grand-budapest-hotel-2014', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Grand_Budapest_Hotel.png', title: 'The Grand Budapest Hotel', year: 2014, runtime: 99, rating: 8.1,
    genres: ['comedy', 'adventure', 'crime'], directors: ['Wes Anderson'],
    cast: ['Ralph Fiennes', 'Tony Revolori', 'F. Murray Abraham'],
    overview: 'A legendary hotel concierge and his lobby boy are drawn into a theft and a family fortune feud between the wars.',
  },
  {
    id: 'forrest-gump-1994', posterPath: 'https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg', title: 'Forrest Gump', year: 1994, runtime: 142, rating: 8.8,
    genres: ['drama', 'romance', 'comedy'], directors: ['Robert Zemeckis'],
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    overview: 'A kind-hearted Alabama man unexpectedly witnesses and influences decades of American history.',
  },
  {
    id: 'cast-away-2000', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Cast_away_film_poster.jpg', title: 'Cast Away', year: 2000, runtime: 143, rating: 7.8,
    genres: ['adventure', 'drama'], directors: ['Robert Zemeckis'],
    cast: ['Tom Hanks', 'Helen Hunt'],
    overview: 'A systems engineer stranded on a deserted island after a plane crash must learn to survive alone.',
  },
  {
    id: 'eternal-sunshine-of-the-spotless-mind-2004', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Eternal_Sunshine_of_the_Spotless_Mind.png', title: 'Eternal Sunshine of the Spotless Mind', year: 2004, runtime: 108, rating: 8.3,
    genres: ['drama', 'romance', 'sci-fi'], directors: ['Michel Gondry'],
    cast: ['Jim Carrey', 'Kate Winslet', 'Kirsten Dunst', 'Mark Ruffalo', 'Elijah Wood'],
    overview: 'After a painful break-up, a man undergoes a procedure to erase his memories of his former girlfriend.',
  },
  {
    id: 'her-2013', posterPath: 'https://upload.wikimedia.org/wikipedia/en/4/44/Her2013Poster.jpg', title: 'Her', year: 2013, runtime: 126, rating: 8.0,
    genres: ['drama', 'romance', 'sci-fi'], directors: ['Spike Jonze'],
    cast: ['Joaquin Phoenix', 'Amy Adams', 'Scarlett Johansson', 'Rooney Mara'],
    overview: 'A lonely writer develops an unlikely relationship with an artificially intelligent operating system.',
  },
  {
    id: 'parasite-2019', posterPath: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png', title: 'Parasite', year: 2019, runtime: 132, rating: 8.5,
    genres: ['comedy', 'drama', 'thriller'], directors: ['Bong Joon Ho'],
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    overview: 'A poor family schemes its way into working for a wealthy household, until a discovery upends everything.',
  },
  {
    id: 'the-shawshank-redemption-1994', posterPath: 'https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg', title: 'The Shawshank Redemption', year: 1994, runtime: 142, rating: 9.3,
    genres: ['drama'], directors: ['Frank Darabont'],
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    overview: 'A banker sentenced to life in prison forms a lasting friendship and quietly holds on to hope.',
  },
  {
    id: 'the-green-mile-1999', posterPath: 'https://upload.wikimedia.org/wikipedia/en/e/e2/The_Green_Mile_%28movie_poster%29.jpg', title: 'The Green Mile', year: 1999, runtime: 189, rating: 8.6,
    genres: ['crime', 'drama', 'fantasy'], directors: ['Frank Darabont'],
    cast: ['Tom Hanks', 'Michael Clarke Duncan', 'David Morse'],
    overview: 'A death-row prison guard comes to believe that one of his inmates has a miraculous gift.',
  },
  {
    id: 'the-revenant-2015', posterPath: 'https://upload.wikimedia.org/wikipedia/en/b/b6/The_Revenant_2015_film_poster.jpg', title: 'The Revenant', year: 2015, runtime: 156, rating: 8.0,
    genres: ['adventure', 'drama'], directors: ['Alejandro G. Iñárritu'],
    cast: ['Leonardo DiCaprio', 'Tom Hardy', 'Will Poulter'],
    overview: 'Left for dead after a bear attack, a frontiersman crosses a frozen wilderness to find the man who betrayed him.',
  },
  {
    id: 'joker-2019', posterPath: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg', title: 'Joker', year: 2019, runtime: 122, rating: 8.4,
    genres: ['crime', 'drama', 'thriller'], directors: ['Todd Phillips'],
    cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz'],
    overview: 'A struggling comedian in Gotham City descends into violence as society repeatedly fails him.',
  },

  // --- Crime classics ---------------------------------------------------------
  {
    id: 'the-godfather-1972', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg', title: 'The Godfather', year: 1972, runtime: 175, rating: 9.2,
    genres: ['crime', 'drama'], directors: ['Francis Ford Coppola'],
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    overview: 'The ageing head of a crime dynasty hands control to his reluctant youngest son.',
  },
  {
    id: 'heat-1995', posterPath: 'https://upload.wikimedia.org/wikipedia/en/6/6c/Heatposter.jpg', title: 'Heat', year: 1995, runtime: 170, rating: 8.3,
    genres: ['action', 'crime', 'drama'], directors: ['Michael Mann'],
    cast: ['Al Pacino', 'Robert De Niro', 'Val Kilmer'],
    overview: 'A dedicated LAPD detective and a disciplined professional thief circle each other across Los Angeles.',
  },

  // --- Horror & suspense ------------------------------------------------------
  {
    id: 'get-out-2017', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Get_Out_poster.png', title: 'Get Out', year: 2017, runtime: 104, rating: 7.8,
    genres: ['horror', 'mystery', 'thriller'], directors: ['Jordan Peele'],
    cast: ['Daniel Kaluuya', 'Allison Williams', 'Bradley Whitford'],
    overview: 'A young man’s weekend visit to his girlfriend’s family estate reveals something deeply sinister.',
  },
  {
    id: 'us-2019', posterPath: 'https://upload.wikimedia.org/wikipedia/en/0/00/Us_%282019%29_theatrical_poster.png', title: 'Us', year: 2019, runtime: 116, rating: 6.8,
    genres: ['horror', 'mystery', 'thriller'], directors: ['Jordan Peele'],
    cast: ['Lupita Nyong’o', 'Winston Duke', 'Elisabeth Moss'],
    overview: 'A family’s beach holiday turns into a nightmare when menacing doppelgängers appear outside their house.',
  },
  {
    id: 'the-shining-1980', posterPath: 'https://upload.wikimedia.org/wikipedia/en/1/1d/The_Shining_%281980%29_U.K._release_poster_-_The_tide_of_terror_that_swept_America_IS_HERE.jpg', title: 'The Shining', year: 1980, runtime: 146, rating: 8.4,
    genres: ['horror', 'drama'], directors: ['Stanley Kubrick'],
    cast: ['Jack Nicholson', 'Shelley Duvall', 'Danny Lloyd'],
    overview: 'A writer becomes the winter caretaker of an isolated hotel, where a sinister presence works on his mind.',
  },
  {
    id: 'a-quiet-place-2018', posterPath: 'https://upload.wikimedia.org/wikipedia/en/a/a0/A_Quiet_Place_film_poster.png', title: 'A Quiet Place', year: 2018, runtime: 90, rating: 7.5,
    genres: ['horror', 'sci-fi', 'drama'], directors: ['John Krasinski'],
    cast: ['Emily Blunt', 'John Krasinski', 'Millicent Simmonds'],
    overview: 'A family survives in silence in a world overrun by creatures that hunt by sound.',
  },
];
