import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import Film from "../models/film.js";
import User from "../models/user.js";

const createAdminToken = (userId) => {
  return jwt.sign(
    { id: userId, role: "admin" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );
};

describe("Films API", () => {
  let adminUser;
  let adminToken;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Créer un utilisateur admin de test
    adminUser = await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin"
    });

    adminToken = createAdminToken(adminUser._id);
  });

  describe("POST /api/films", () => {
    it("devrait créer un nouveau film avec toutes les données valides", async () => {
      const filmData = {
        title: "Inception",
        year: 2010,
        director: "Christopher Nolan",
        genre: "Science-Fiction",
        image: "https://example.com/inception.jpg"
      };

      const response = await request(app)
        .post("/api/films")
        .set("Cookie", `auth_token=${adminToken}`)
        .send(filmData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.title).toBe(filmData.title);
      expect(response.body.year).toBe(filmData.year);
      expect(response.body.director).toBe(filmData.director);
      expect(response.body.genre).toBe(filmData.genre);
    });

    it("devrait retourner une erreur 400 si des champs requis manquent", async () => {
      const filmData = {
        title: "Inception",
        year: 2010
        // director et genre manquants
      };

      const response = await request(app)
        .post("/api/films")
        .set("Cookie", `auth_token=${adminToken}`)
        .send(filmData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("devrait rejeter sans authentification", async () => {
      const filmData = {
        title: "Inception",
        year: 2010,
        director: "Christopher Nolan",
        genre: "Science-Fiction"
      };

      const response = await request(app)
        .post("/api/films")
        .send(filmData)
        .expect(401);

      expect(response.body.message).toContain("Non autorisé");
    });
  });

  describe("GET /api/films", () => {
    it("devrait retourner une liste vide quand aucun film n'existe", async () => {
      const response = await request(app)
        .get("/api/films")
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("devrait retourner tous les films", async () => {
      await Film.create([
        {
          title: "Inception",
          year: 2010,
          director: "Christopher Nolan",
          genre: "Science-Fiction"
        },
        {
          title: "The Matrix",
          year: 1999,
          director: "Wachowski Sisters",
          genre: "Science-Fiction"
        }
      ]);

      const response = await request(app)
        .get("/api/films")
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("title");
      expect(response.body[1]).toHaveProperty("title");
    });
  });

  describe("GET /api/films/:id", () => {
    it("devrait retourner un film spécifique par son ID", async () => {
      const film = await Film.create({
        title: "Inception",
        year: 2010,
        director: "Christopher Nolan",
        genre: "Science-Fiction"
      });

      const response = await request(app)
        .get(`/api/films/${film._id}`)
        .expect(200);

      expect(response.body._id).toBe(film._id.toString());
      expect(response.body.title).toBe("Inception");
    });
  });
});