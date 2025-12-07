import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import Film from "../models/film.js";

describe("Films API", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
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

  describe("PUT /api/films/:id", () => {
    it("devrait mettre à jour un film existant", async () => {
      const film = await Film.create({
        title: "Inception",
        year: 2010,
        director: "Christopher Nolan",
        genre: "Science-Fiction"
      });

      const updatedData = {
        title: "Inception Updated",
        year: 2011
      };

      const response = await request(app)
        .put(`/api/films/${film._id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.title).toBe("Inception Updated");
      expect(response.body.year).toBe(2011);
      expect(response.body.director).toBe("Christopher Nolan"); // Inchangé
    });

    it("devrait retourner 404 pour un ID inexistant", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .put(`/api/films/${fakeId}`)
        .send({ title: "Test" })
        .expect(404);

      expect(response.body).toHaveProperty("message");
    });

    it("devrait retourner 400 pour un ID invalide", async () => {
      const response = await request(app)
        .put("/api/films/invalid-id")
        .send({ title: "Test" })
        .expect(400);

      expect(response.body.message).toContain("invalide");
    });
  });

  describe("DELETE /api/films/:id", () => {
    it("devrait supprimer un film existant", async () => {
      const film = await Film.create({
        title: "Inception",
        year: 2010,
        director: "Christopher Nolan",
        genre: "Science-Fiction"
      });

      const response = await request(app)
        .delete(`/api/films/${film._id}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("supprimé");

      // Vérifier que le film a été supprimé
      const deletedFilm = await Film.findById(film._id);
      expect(deletedFilm).toBeNull();
    });

    it("devrait retourner 404 pour un ID inexistant", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/api/films/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty("message");
    });
  });
});