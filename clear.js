import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Film from "./models/film.js";
import Quote from "./models/quote.js";

dotenv.config();
await mongoose.connect(process.env.DATABASE_URL);

await Quote.deleteMany();
await Film.deleteMany();

console.log("Films et citations supprimés !");
await mongoose.disconnect();
process.exit();