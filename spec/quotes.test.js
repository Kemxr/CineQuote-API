import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import Quote from "../models/quote.js";
import Film from "../models/film.js";
import User from "../models/user.js";

// Fonction helper pour créer un token admin
const createAdminToken = (userId) => {
  return jwt.sign(
    { id: userId, role: "admin" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );
};

describe("Quotes API", () => {
  let testFilm;
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

    // Créer un film de test
    testFilm = await Film.create({
      title: "Test Film",
      year: 2020,
      director: "Test Director",
      genre: "Drama"
    });

    // Créer un utilisateur admin de test
    adminUser = await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin"
    });

    adminToken = createAdminToken(adminUser._id);
  });

  describe("GET /api/quotes", () => {
    it("devrait retourner une liste vide avec pagination", async () => {
      const response = await request(app)
        .get("/api/quotes")
        .expect(200);

      expect(response.body).toHaveProperty("items");
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.page).toBe(1);
    });

    it("devrait retourner toutes les citations avec pagination", async () => {
      // Créer des citations de test
      await Quote.create([
        {
          text: "To be or not to be",
          emotion: "philosophical",
          film: testFilm._id
        },
        {
          text: "I'll be back",
          emotion: "determined",
          film: testFilm._id
        }
      ]);

      const response = await request(app)
        .get("/api/quotes")
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.items[0]).toHaveProperty("text");
    });

    it("devrait filtrer les citations par émotion", async () => {
      await Quote.create([
        {
          text: "Happy quote",
          emotion: "happy",
          film: testFilm._id
        },
        {
          text: "Sad quote",
          emotion: "sad",
          film: testFilm._id
        }
      ]);

      const response = await request(app)
        .get("/api/quotes?emotion=happy")
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].emotion).toBe("happy");
    });

    it("devrait paginer correctement les résultats", async () => {
      // Créer 5 citations
      for (let i = 0; i < 5; i++) {
        await Quote.create({
          text: `Quote ${i}`,
          emotion: "neutral",
          film: testFilm._id
        });
      }

      const response = await request(app)
        .get("/api/quotes?page=1&limit=2")
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
      expect(response.body.total).toBe(5);
      expect(response.body.totalPages).toBe(3);
    });
  });

  describe("GET /api/quotes/random", () => {
    it("devrait retourner 404 quand aucune citation n'existe", async () => {
      const response = await request(app)
        .get("/api/quotes/random")
        .expect(404);

      expect(response.body.message).toContain("Aucune citation");
    });

    it("devrait retourner une citation aléatoire", async () => {
      await Quote.create({
        text: "Random quote",
        emotion: "happy",
        film: testFilm._id
      });

      const response = await request(app)
        .get("/api/quotes/random")
        .expect(200);

      expect(response.body).toHaveProperty("text");
      expect(response.body).toHaveProperty("film");
    });
  });

  describe("POST /api/quotes (Admin only)", () => {
    it("devrait créer une citation avec authentification admin", async () => {
      const quoteData = {
        text: "New quote",
        emotion: "inspired",
        film: testFilm._id.toString()
      };

      const response = await request(app)
        .post("/api/quotes")
        .set("Cookie", `auth_token=${adminToken}`)
        .send(quoteData)
        .expect(201);

      expect(response.body.text).toBe(quoteData.text);
      expect(response.body.emotion).toBe(quoteData.emotion);
    });

    it("devrait rejeter la création sans authentification", async () => {
      const quoteData = {
        text: "New quote",
        emotion: "inspired",
        film: testFilm._id.toString()
      };

      await request(app)
        .post("/api/quotes")
        .send(quoteData)
        .expect(401);
    });
  });

  describe("PATCH /api/quotes/:id (Admin only)", () => {
    it("devrait mettre à jour une citation existante", async () => {
      const quote = await Quote.create({
        text: "Original text",
        emotion: "neutral",
        film: testFilm._id
      });

      const updatedData = {
        text: "Updated text",
        emotion: "happy"
      };

      const response = await request(app)
        .patch(`/api/quotes/${quote._id}`)
        .set("Cookie", `auth_token=${adminToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.text).toBe("Updated text");
      expect(response.body.emotion).toBe("happy");
    });

    it("devrait rejeter la mise à jour sans authentification", async () => {
      const quote = await Quote.create({
        text: "Original text",
        emotion: "neutral",
        film: testFilm._id
      });

      await request(app)
        .patch(`/api/quotes/${quote._id}`)
        .send({ text: "Updated" })
        .expect(401);
    });
  });

  describe("DELETE /api/quotes/:id (Admin only)", () => {
    it("devrait supprimer une citation existante", async () => {
      const quote = await Quote.create({
        text: "To be deleted",
        emotion: "neutral",
        film: testFilm._id
      });

      const response = await request(app)
        .delete(`/api/quotes/${quote._id}`)
        .set("Cookie", `auth_token=${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");

      // Vérifier que la citation a été supprimée
      const deletedQuote = await Quote.findById(quote._id);
      expect(deletedQuote).toBeNull();
    });

    it("devrait rejeter la suppression sans authentification", async () => {
      const quote = await Quote.create({
        text: "To be deleted",
        emotion: "neutral",
        film: testFilm._id
      });

      await request(app)
        .delete(`/api/quotes/${quote._id}`)
        .expect(401);
    });
  });
});