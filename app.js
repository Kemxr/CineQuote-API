import express from "express";
import createError from "http-errors";
import logger from "morgan";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser"

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import favoritesRouter from "./routes/favorites.js";
import filmsRouter from "./routes/films.js"
import quotesRouter from "./routes/quotes.js"

dotenv.config();

mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost/cine-quote-api");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/films", filmsRouter);
app.use("/api/quotes", quotesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
