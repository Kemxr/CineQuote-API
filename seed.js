import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Film from "./models/film.js";
import Quote from "./models/quote.js";

dotenv.config();

await mongoose.connect(process.env.DATABASE_URL);

await Quote.deleteMany();
await Film.deleteMany();

const films = await Film.insertMany([
  {
    title: "The Lion King",
    year: 1994,
    director: "Roger Allers, Rob Minkoff",
    genre: "Animation / Aventure / Famille",
    image:
      "https://image.tmdb.org/t/p/original/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
  },
  {
    title: "Finding Nemo",
    year: 2003,
    director: "Andrew Stanton, Lee Unkrich",
    genre: "Animation / Aventure / Comédie",
    image: "https://image.tmdb.org/t/p/w1280/5lc6nQc0VhWFYFbNv016xze8Jvy.jpg",
  },
  {
    title: "Toy Story",
    year: 1994,
    director: "John Lasseter",
    genre: "Animation / Aventure / Comédie",
    image: "https://image.tmdb.org/t/p/w1280/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
  },
  {
    title: "The Sandlot",
    year: 1993,
    director: "David Mickey Evans",
    genre: "Comédie / Famille / Sport",
    image: "https://image.tmdb.org/t/p/w1280/7PYqz0viEuW8qTvuGinUMjDWMnj.jpg",
  },
  {
    title: "Titanic",
    year: 1998,
    director: "James Cameron",
    genre: "Romance / Drame / Catastrophe",
    image: "https://image.tmdb.org/t/p/w1280/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
  },
  {
    title: "Star Wars: Episode V – The Empire Strikes Back",
    year: 1980,
    director: "Irvin Kershner",
    genre: "Science-Fiction / Aventure / Action",
    image: "https://image.tmdb.org/t/p/w1280/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg",
  },
  {
    title: "Up",
    year: 2009,
    director: "Pete Docter, Bob Peterson",
    genre: "Animation / Aventure / Comédie",
    image: "https://image.tmdb.org/t/p/w1280/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg",
  },
  {
    title: "Jurassic Park",
    year: 1993,
    director: "Steven Spielberg",
    genre: "Science-Fiction / Aventure / Thriller",
    image: "https://image.tmdb.org/t/p/w1280/bRKmwU9eXZI5dKT11Zx1KsayiLW.jpg",
  },
  {
    title: "Back to the Future",
    year: 1985,
    director: "Robert Zemeckis",
    genre: "Science-Fiction / Comédie / Aventure",
    image:
      "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg",
  },
  {
    title: "Top Gun",
    year: 1986,
    director: "Tony Scott",
    genre: "Action / Drame",
    image:
      "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/xUuHj3CgmZQ9P2cMaqQs4J0d4Zc.jpg",
  },
  {
    title: "Teenage Mutant Ninja Turtles",
    year: 1990,
    director: "Steve Barron",
    genre: "Action / Aventure / Fantaisie",
    image:
      "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/shfAU6xIIEAEtsloIT3n9Fscz2E.jpg",
  },
  {
    title: "The Dark Knight",
    year: 2008,
    director: "Christopher Nolan",
    genre: "Action / Thriller / Super-héros",
    image:
      "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    title: "The Terminator",
    year: 1985,
    director: "James Cameron",
    genre: "Science-Fiction / Action / Thriller",
    image:
      "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/hzXSE66v6KthZ8nPoLZmsi2G05j.jpg",
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    year: 2001,
    director: "Chris Columbus",
    genre: "Fantaisie / Aventure / Famille",
    image:
      "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
  },
  {
    title: "Beetlejuice",
    year: 1988,
    director: "Tim Burton",
    genre: "Comédie / Fantaisie / Horreur",
    image:
      "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/nnl6OWkyPpuMm595hmAxNW3rZFn.jpg",
  },
  {
    title: "Frankenstein",
    year: 2015,
    director: "Bernard Rose",
    genre: "Horreur / Thriller",
    image:
      "https://image.tmdb.org/t/p/original/53r1Wp8pdDzN4hA1WZyLBMDjMiX.jpg",
  },
  {
    title: "Guardians of the Galaxy Vol. 2",
    year: 2017,
    director: "James Gunn",
    genre: "Science-fiction / Action",
    image:
      "https://image.tmdb.org/t/p/original/tTnDWIADl5FbpxHBO07IQCNxyb9.jpg",
  },
  {
    title: "Black Panther",
    year: 2018,
    director: "Ryan Coogler",
    genre: "Action / Super-héros",
    image:
      "https://image.tmdb.org/t/p/original/g94IcdzPswTYl1ISdgn2EwvaZtt.jpg",
  },
  {
    title: "Midnight Cowboy",
    year: 1969,
    director: "John Schlesinger",
    genre: "Drama",
    image:
      "https://image.tmdb.org/t/p/original/yoom7CNgdomR7tn0T9GOdHYY51u.jpg",
  },
  {
    title: "Jerry Maguire",
    year: 1996,
    director: "Cameron Crowe",
    genre: "Drama / Romance",
    image:
      "https://image.tmdb.org/t/p/original/cvObzfTrrSccb8npb2ltB7rV2cT.jpg",
  },
  {
    title: "The Shining",
    year: 1980,
    director: "Stanley Kubrick",
    genre: "Horror / Thriller",
    image:
      "https://image.tmdb.org/t/p/original/cnniZQGtjK8kh2tsjih4GtkX6bl.jpg",
  },
  {
    title: "Wayne's World",
    year: 1992,
    director: "Penelope Spheeris",
    genre: "Comedy",
    image: "https://image.tmdb.org/t/p/original/R8Q9qIl51SHtcX5oWSBbz4YhQV.jpg",
  },
  {
    title: "Scarface",
    year: 1983,
    director: "Brian De Palma",
    genre: "Crime / Drama",
    image:
      "https://image.tmdb.org/t/p/original/eGctboDIdxBSxZIcF8iLc8gebd5.jpg",
  },
  {
    title: "Iron Man",
    year: 2008,
    director: "Jon Favreau",
    genre: "Action / Superhero",
    image:
      "https://image.tmdb.org/t/p/original/kNKUCNLu1lZDGAHOBEHxR6psYHx.jpg",
  },
  {
    title: "300",
    year: 2007,
    director: "Zack Snyder",
    genre: "Action / War",
    image:
      "https://image.tmdb.org/t/p/original/hGZ9sDGcekhJUFmu3NnOhRT8uQS.jpg",
  },
  {
    title: "A Few Good Men",
    year: 1992,
    director: "Rob Reiner",
    genre: "Drama",
    image:
      "https://image.tmdb.org/t/p/original/vsjxwIGaA8GP79pgtv6dqRhRsPu.jpg",
  },
  {
    title: "Star Wars",
    year: 1977,
    director: "George Lucas",
    genre: "Science-fiction",
    image:
      "https://image.tmdb.org/t/p/original/rLi9cokiFU20mLUPvQ0IRok3ELY.jpg",
  },
  {
    title: "When Harry Met Sally",
    year: 1989,
    director: "Rob Reiner",
    genre: "Romantic Comedy",
    image:
      "https://image.tmdb.org/t/p/original/9pPRS02vf7sRYmmGtRERFspiIZO.jpg",
  },
  {
    title: "Peter Pan",
    year: 1953,
    director: "Clyde Geronimi, Wilfred Jackson, Hamilton Luske",
    genre: "Animation / Fantasy",
    image:
      "https://image.tmdb.org/t/p/original/lsNXA11gQZbRfpYf6AXZzj3nEsY.jpg",
  },
]);

const quotes = [
  // block 1 (joy)
  {
    text: "Hakuna Matata!",
    emotion: "joy",
    film: films[0]._id,
  },
  {
    text: "Just keep swimming.",
    emotion: "joy",
    film: films[1]._id,
  },
  {
    text: "To infinity and beyond!",
    emotion: "joy",
    film: films[2]._id,
  },
  {
    text: "You’re killing me, Smalls!",
    emotion: "joy",
    film: films[3]._id,
  },
  {
    text: "I’m the king of the world!",
    emotion: "joy",
    film: films[4]._id,
  },
  {
    text: "Never tell me the odds.",
    emotion: "joy",
    film: films[5]._id,
  },
  {
    text: "Adventure is out there!",
    emotion: "joy",
    film: films[6]._id,
  },
  {
    text: "Life finds a way.",
    emotion: "joy",
    film: films[7]._id,
  },
  {
    text: "Great Scott!",
    emotion: "joy",
    film: films[8]._id,
  },
  {
    text: "I feel the need for speed.",
    emotion: "joy",
    film: films[9]._id,
  },
  {
    text: "Cowabunga!",
    emotion: "joy",
    film: films[10]._id,
  },
  {
    text: "Why so serious?",
    emotion: "joy",
    film: films[11]._id,
  },
  {
    text: "I’ll be back.",
    emotion: "joy",
    film: films[12]._id,
  },
  {
    text: "This is the way.",
    emotion: "joy",
    film: films[13]._id,
  },
  {
    text: "You’re a wizard, Harry.",
    emotion: "joy",
    film: films[14]._id,
  },
  {
    text: "It’s showtime!",
    emotion: "joy",
    film: films[15]._id,
  },
  {
    text: "It’s alive!",
    emotion: "joy",
    film: films[16]._id,
  },
  {
    text: "I am Groot.",
    emotion: "joy",
    film: films[17]._id,
  },
  {
    text: "Wakanda forever!",
    emotion: "joy",
    film: films[18]._id,
  },
  {
    text: "I’m walking here!",
    emotion: "joy",
    film: films[19]._id,
  },
  {
    text: "Show me the money!",
    emotion: "joy",
    film: films[20]._id,
  },
  {
    text: "Here’s Johnny!",
    emotion: "joy",
    film: films[21]._id,
  },
  {
    text: "Party on, Wayne!",
    emotion: "joy",
    film: films[22]._id,
  },
  {
    text: "Say hello to my little friend!",
    emotion: "joy",
    film: films[23]._id,
  },
  {
    text: "I am Iron Man.",
    emotion: "joy",
    film: films[24]._id,
  },
  {
    text: "This is Sparta!",
    emotion: "joy",
    film: films[25]._id,
  },
  {
    text: "You can’t handle the truth!",
    emotion: "joy",
    film: films[26]._id,
  },
  {
    text: "May the Force be with you.",
    emotion: "joy",
    film: films[27]._id,
  },
  {
    text: "I’ll have what she’s having.",
    emotion: "joy",
    film: films[28]._id,
  },

  // block 2 (sadness)
  {
    text: "I'm glad you were here with me.",
    emotion: "sadness",
    film: films[0]._id,
  },
  {
    text: "I see dead people.",
    emotion: "sadness",
    film: films[1]._id,
  },
  {
    text: "I’m sorry, Wilson!",
    emotion: "sadness",
    film: films[2]._id,
  },
  {
    text: "Don't let go.",
    emotion: "sadness",
    film: films[3]._id,
  },
  {
    text: "You have been weighed.",
    emotion: "sadness",
    film: films[4]._id,
  },
  {
    text: "I’m not a smart man.",
    emotion: "sadness",
    film: films[5]._id,
  },
  { text: "Rosebud.", 
    emotion: "sadness", 
    film: films[6]._id 
},
  {
    text: "Goodbye, old friend.",
    emotion: "sadness",
    film: films[7]._id,
  },
  {
    text: "I’m scared.",
    emotion: "sadness",
    film: films[8]._id,
  },
  {
    text: "I’ll miss you.",
    emotion: "sadness",
    film: films[9]._id,
  },
  {
    text: "Why did you leave?",
    emotion: "sadness",
    film: films[10]._id,
  },
  {
    text: "He’s gone.",
    emotion: "sadness",
    film: films[11]._id,
  },
  {
    text: "There’s no place for me.",
    emotion: "sadness",
    film: films[12]._id,
  },
  {
    text: "It wasn’t enough.",
    emotion: "sadness",
    film: films[13]._id,
  },
  {
    text: "I failed you.",
    emotion: "sadness",
    film: films[14]._id,
  },
  {
    text: "I tried.",
    emotion: "sadness",
    film: films[15]._id,
  },
  {
    text: "I didn’t want this.",
    emotion: "sadness",
    film: films[16]._id,
  },
  {
    text: "I can’t do this alone.",
    emotion: "sadness",
    film: films[17]._id,
  },
  {
    text: "Please stay.",
    emotion: "sadness",
    film: films[18]._id,
  },
  {
    text: "Forgive me.",
    emotion: "sadness",
    film: films[19]._id,
  },
  {
    text: "What have I done?",
    emotion: "sadness",
    film: films[20]._id,
  },
  {
    text: "I remember everything.",
    emotion: "sadness",
    film: films[21]._id,
  },
  {
    text: "I lost her.",
    emotion: "sadness",
    film: films[22]._id,
  },
  {
    text: "It hurts.",
    emotion: "sadness",
    film: films[23]._id,
  },
  {
    text: "Nothing ever changes.",
    emotion: "sadness",
    film: films[24]._id,
  },
  {
    text: "You said you’d come back.",
    emotion: "sadness",
    film: films[25]._id,
  },
  {
    text: "This is goodbye.",
    emotion: "sadness",
    film: films[26]._id,
  },
  {
    text: "I’m falling apart.",
    emotion: "sadness",
    film: films[27]._id,
  },
  {
    text: "I wish it were different.",
    emotion: "sadness",
    film: films[28]._id,
  },

  // block 3 (love)
  {
    text: "You complete me.",
    emotion: "love",
    film: films[0]._id,
  },
  {
    text: "As you wish.",
    emotion: "love",
    film: films[1]._id,
  },
  {
    text: "I’ll never let go.",
    emotion: "love",
    film: films[2]._id,
  },
  {
    text: "Here’s looking at you, kid.",
    emotion: "love",
    film: films[3]._id,
  },
  {
    text: "I’m yours.",
    emotion: "love",
    film: films[4]._id,
  },
  {
    text: "To me, you are perfect.",
    emotion: "love",
    film: films[5]._id,
  },
  { text: "Always.", 
    emotion: "love", 
    film: films[6]._id, 
},
  {
    text: "I choose you.",
    emotion: "love",
    film: films[7]._id,
  },
  {
    text: "You had me at hello.",
    emotion: "love",
    film: films[8]._id,
  },
  {
    text: "I love you. I know.",
    emotion: "love",
    film: films[9]._id,
  },
  {
    text: "I burn for you.",
    emotion: "love",
    film: films[10]._id,
  },
  {
    text: "I found you.",
    emotion: "love",
    film: films[11]._id,
  },
  {
    text: "You make me whole.",
    emotion: "love",
    film: films[12]._id,
  },
  {
    text: "Stay with me.",
    emotion: "love",
    film: films[13]._id,
  },
  {
    text: "I’ll wait for you.",
    emotion: "love",
    film: films[14]._id,
  },
  {
    text: "You’re my person.",
    emotion: "love",
    film: films[15]._id,
  },
  {
    text: "I’m in love.",
    emotion: "love",
    film: films[16]._id,
  },
  {
    text: "Take my hand.",
    emotion: "love",
    film: films[17]._id,
  },
  {
    text: "Forever.",
    emotion: "love",
    film: films[18]._id,
  },
  {
    text: "Come back to me.",
    emotion: "love",
    film: films[19]._id,
  },
  {
    text: "You’re everything.",
    emotion: "love",
    film: films[20]._id,
  },
  {
    text: "You save me.",
    emotion: "love",
    film: films[21]._id,
  },
  {
    text: "Only you.",
    emotion: "love",
    film: films[22]._id,
  },
  {
    text: "I won’t leave.",
    emotion: "love",
    film: films[23]._id,
  },
  {
    text: "You matter to me.",
    emotion: "love",
    film: films[24]._id,
  },
  {
    text: "I believe in us.",
    emotion: "love",
    film: films[25]._id,
  },
  {
    text: "You’re worth it.",
    emotion: "love",
    film: films[26]._id,
  },
  {
    text: "My heart is yours.",
    emotion: "love",
    film: films[27]._id,
  },
  {
    text: "Don’t go.",
    emotion: "love",
    film: films[28]._id,
  },

  // block 4 (nostalgia)
  {
    text: "There's no place like home.",
    emotion: "nostalgia",
    film: films[0]._id,
  },
  {
    text: "I’ll be right here.",
    emotion: "nostalgia",
    film: films[1]._id,
  },
  {
    text: "You shall not pass!",
    emotion: "nostalgia",
    film: films[2]._id,
  },
  {
    text: "Phone home.",
    emotion: "nostalgia",
    film: films[3]._id,
  },
  {
    text: "I feel happy!",
    emotion: "nostalgia",
    film: films[4]._id,
  },
  {
    text: "Roads? Where we’re going, we don’t need roads.",
    emotion: "nostalgia",
    film: films[5]._id,
  },
  {
    text: "Run, Forrest, run!",
    emotion: "nostalgia",
    film: films[6]._id,
  },
  {
    text: "Snap out of it!",
    emotion: "nostalgia",
    film: films[7]._id,
  },
  {
    text: "It’s a trap!",
    emotion: "nostalgia",
    film: films[8]._id,
  },
  {
    text: "I’ll never forget this.",
    emotion: "nostalgia",
    film: films[9]._id,
  },
  {
    text: "This is home.",
    emotion: "nostalgia",
    film: films[10]._id,
  },
  {
    text: "We had good times.",
    emotion: "nostalgia",
    film: films[11]._id,
  },
  {
    text: "I remember this.",
    emotion: "nostalgia",
    film: films[12]._id,
  },
  {
    text: "Feels familiar.",
    emotion: "nostalgia",
    film: films[13]._id,
  },
  {
    text: "We were unstoppable.",
    emotion: "nostalgia",
    film: films[14]._id,
  },
  {
    text: "Everything was simpler.",
    emotion: "nostalgia",
    film: films[15]._id,
  },
  {
    text: "I wish we could go back.",
    emotion: "nostalgia",
    film: films[16]._id,
  },
  {
    text: "This takes me back.",
    emotion: "nostalgia",
    film: films[17]._id,
  },
  {
    text: "Once upon a time.",
    emotion: "nostalgia",
    film: films[18]._id,
  },
  {
    text: "Long ago.",
    emotion: "nostalgia",
    film: films[19]._id,
  },
  {
    text: "Not again.",
    emotion: "nostalgia",
    film: films[20]._id,
  },
  {
    text: "I’ve heard this before.",
    emotion: "nostalgia",
    film: films[21]._id,
  },
  {
    text: "Remember?",
    emotion: "nostalgia",
    film: films[22]._id,
  },
  {
    text: "Seems like yesterday.",
    emotion: "nostalgia",
    film: films[23]._id,
  },
  {
    text: "Same old story.",
    emotion: "nostalgia",
    film: films[24]._id,
  },
  {
    text: "Feels like home.",
    emotion: "nostalgia",
    film: films[25]._id,
  },
  {
    text: "Just like old times.",
    emotion: "nostalgia",
    film: films[26]._id,
  },
  {
    text: "We meet again.",
    emotion: "nostalgia",
    film: films[27]._id,
  },
  {
    text: "Hello old friend.",
    emotion: "nostalgia",
    film: films[28]._id,
  },

  // block 5 (anxiety)
  {
    text: "I have a bad feeling about this.",
    emotion: "anxiety",
    film: films[0]._id,
  },
  {
    text: "They're coming.",
    emotion: "anxiety",
    film: films[1]._id,
  },
  {
    text: "We’re not alone.",
    emotion: "anxiety",
    film: films[2]._id,
  },
  {
    text: "Don't move.",
    emotion: "anxiety",
    film: films[3]._id,
  },
  {
    text: "Stay quiet.",
    emotion: "anxiety",
    film: films[4]._id,
  },
  {
    text: "It’s behind you.",
    emotion: "anxiety",
    film: films[5]._id,
  },
  { text: "Run!", 
    emotion: "anxiety", 
    film: films[6]._id, 
  },
  {
    text: "Something’s wrong.",
    emotion: "anxiety",
    film: films[7]._id,
  },
  {
    text: "I can't breathe.",
    emotion: "anxiety",
    film: films[8]._id,
  },
  {
    text: "They're watching us.",
    emotion: "anxiety",
    film: films[9]._id,
  },
  {
    text: "We have to go now.",
    emotion: "anxiety",
    film: films[10]._id,
  },
  {
    text: "Don't look down.",
    emotion: "anxiety",
    film: films[11]._id,
  },
  {
    text: "Keep going.",
    emotion: "anxiety",
    film: films[12]._id,
  },
  {
    text: "This is not good.",
    emotion: "anxiety",
    film: films[13]._id,
  },
  {
    text: "We’re trapped.",
    emotion: "anxiety",
    film: films[14]._id,
  },
  {
    text: "I’m not ready.",
    emotion: "anxiety",
    film: films[15]._id,
  },
  {
    text: "I can’t do this.",
    emotion: "anxiety",
    film: films[16]._id,
  },
  {
    text: "I hear something.",
    emotion: "anxiety",
    film: films[17]._id,
  },
  {
    text: "It’s too quiet.",
    emotion: "anxiety",
    film: films[18]._id,
  },
  {
    text: "Don't turn around.",
    emotion: "anxiety",
    film: films[19]._id,
  },
  {
    text: "We’re losing time.",
    emotion: "anxiety",
    film: films[20]._id,
  },
  {
    text: "They know we’re here.",
    emotion: "anxiety",
    film: films[21]._id,
  },
  {
    text: "Hold your breath.",
    emotion: "anxiety",
    film: films[22]._id,
  },
  {
    text: "Move!",
    emotion: "anxiety",
    film: films[23]._id,
  },
  {
    text: "We’re surrounded.",
    emotion: "anxiety",
    film: films[24]._id,
  },
  {
    text: "I think we’re next.",
    emotion: "anxiety",
    film: films[25]._id,
  },
  {
    text: "There's no escape.",
    emotion: "anxiety",
    film: films[26]._id,
  },
  {
    text: "It's happening.",
    emotion: "anxiety",
    film: films[27]._id,
  },
  {
    text: "Don’t let go.",
    emotion: "anxiety",
    film: films[28]._id,
  },
];

await Quote.insertMany(quotes);

console.log("Seed terminé !");
await mongoose.disconnect();
process.exit();