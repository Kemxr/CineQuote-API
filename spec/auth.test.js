import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import app , {wsServer} from "../app.js";
import { setupTestDB, teardownTestDB, clearTestDB, setupTestServer, teardownTestServer } from "./setup.js";
import User from "../models/user.js";

describe("Auth API", () => {
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

  describe("POST /api/auth/register", () => {
    it("devrait créer un nouvel utilisateur avec des données valides", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123"
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty("password");
      expect(response.body.role).toBe("user");
    });

    it("devrait rejeter un nom trop court", async () => {
      const userData = {
        name: "J",
        email: "john@example.com",
        password: "password123"
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain("Nom requis");
    });

    it("devrait rejeter un email invalide", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123"
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain("Email invalide");
    });

    it("devrait rejeter un mot de passe trop court", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "12345"
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain("Mot de passe");
    });

    it("devrait rejeter un email déjà utilisé", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123"
      };

      // Créer le premier utilisateur
      await request(app).post("/api/auth/register").send(userData);

      // Essayer de créer un second avec le même email
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain("Email déjà utilisé");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Créer un utilisateur de test
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });
    });

    it("devrait connecter un utilisateur avec des credentials valides", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123"
        })
        .expect(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("token");
      expect(response.body.email).toBe("test@example.com");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("devrait rejeter un email inexistant", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123"
        })
        .expect(400);

      expect(response.body.message).toContain("incorrect");
    });

    it("devrait rejeter un mot de passe incorrect", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword"
        })
        .expect(400);

      expect(response.body.message).toContain("incorrect");
    });

    it("devrait définir un cookie d'authentification", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123"
        })
        .expect(200);

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("auth_token");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("devrait déconnecter l'utilisateur et supprimer le cookie", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .expect(200);

      expect(response.body.message).toContain("Déconnecté");

      const cookies = response.headers["set-cookie"];
      if (cookies) {
        expect(cookies[0]).toContain("auth_token=;");
      }
    });
  });

  describe("GET /api/auth/profile", () => {
    it("devrait retourner le profil de l'utilisateur connecté", async () => {
      // Créer et connecter un utilisateur
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123"
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Cookie", `auth_token=${token}`)
        .expect(200);

      expect(response.body._id).toBe(user._id.toString());
      expect(response.body.email).toBe("test@example.com");
      expect(response.body).not.toHaveProperty("password");
    });

    it("devrait rejeter l'accès sans authentification", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .expect(401);

      expect(response.body.message).toContain("Non autorisé");
    });
  });
});