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
    title: "Le Roi Lion",
    year: 1994,
    director: "Roger Allers, Rob Minkoff",
    genre: "Animation",
    image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/n6UChiAOSTHGih2FBactLjA4Cdt.jpg"
  },
  {
    title: "Forrest Gump",
    year: 1994,
    director: "Robert Zemeckis",
    genre: "Drame",
    image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/zi6RNYK1vXjIvpSBgjatXRcFYh2.jpg"
  }
]);

const quotes = [
  {
    text: "Hakuna Matata !",
    emotion: "joie",
    film: films[0]._id
  },
  {
    text: "La vie, c'est comme une boîte de chocolats.",
    emotion: "philosophie",
    film: films[1]._id
  }
];

await Quote.insertMany(quotes);

console.log("Seed terminé !");
await mongoose.disconnect();
process.exit();