import express from "express";
import createError from "http-errors";
import logger from "morgan";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import webpush from "web-push";

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

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@example.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// In-memory store of push subscriptions for demo purposes
const pushSubscriptions = [];

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

// Simple endpoint to store push subscriptions
app.post("/api/push/subscribe", (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: "Invalid subscription" });
  }

  const exists = pushSubscriptions.find((sub) => sub.endpoint === subscription.endpoint);
  if (!exists) {
    pushSubscriptions.push(subscription);
  }

  return res.status(201).json({ message: "Subscription stored" });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.sendFile(path.join(__dirname, "/frontend/cine-quote-frontend/dist/index.html"));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.send(err.message);
});

// Start HTTP server and WebSocket server
const port = process.env.VITE_WS_PORT || 10000;
httpServer.listen(port, () => console.log(`HTTP server listening on port ${port}`));
wsServer.start({ server: httpServer });

// Periodic job to send a test push notification every 60 seconds
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  setInterval(async () => {
    if (!pushSubscriptions.length) return;

    const payload = JSON.stringify({
      title: "Nouvelle citation",
      body: "Une nouvelle citation du jour est disponible.",
    });

    for (const sub of pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        console.error("Error sending push notification", err);
      }
    }
  }, 30_000);
}

export default app;