import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import app, {wsServer} from "../app.js";
import { setupTestDB, teardownTestDB, clearTestDB, setupTestServer, teardownTestServer } from "./setup.js";
import Film from "../models/film.js";

describe("Films API", () => {
  beforeAll(async () => {
    await setupTestDB();
    await setupTestServer(app, wsServer);
  });

  afterAll(async () => {
    await teardownTestDB();
    await teardownTestServer();
  });

  beforeEach(async () => {
    await clearTestDB();
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
        .send(filmData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
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
      // Créer des films de test
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