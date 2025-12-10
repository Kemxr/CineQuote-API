import express from "express";
import createError from "http-errors";
import logger from "morgan";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import favoritesRouter from "./routes/favorites.js";
import filmsRouter from "./routes/films.js";
import quotesRouter from "./routes/quotes.js";
import { wsServer } from "./store/wsStore.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost/cine-quote-api");

const app = express();
const httpServer = http.createServer(app);

app.use(express.static(path.join(__dirname, "/frontend/cine-quote-frontend/dist")));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/films", filmsRouter);
app.use("/api/quotes", quotesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.sendFile(path.join(__dirname, "/frontend/cine-quote-frontend/dist/index.html"));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({ error: err.message });
});

export { httpServer, wsServer };
export default app;