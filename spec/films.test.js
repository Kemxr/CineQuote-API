import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

describe('GET /films', () => {
  it('devrait renvoyer un tableau de films et un statut 200', async () => {
    const res = await request(app).get('/films');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const film = res.body[0];
      expect(film).toHaveProperty('title');
      expect(film).toHaveProperty('director');
      expect(film).toHaveProperty('genre');
      expect(film).toHaveProperty('year');
    }
  });
});


describe('Sécurité /films - Injection', () => {
  it('devrait rester stable si on injecte du JS/HTML dans le titre ou le réalisateur', async () => {
    const maliciousFilm = {
      title: "<script>alert('film')</script>",
      director: "<img src='x' onerror='alert(1)'>",
      genre: "thriller",
      year: 2024
    };
    const res = await request(app)
      .post('/films')
      .send(maliciousFilm)
      .set('Accept', 'application/json');
    expect([200, 201, 400, 401, 404, 422]).toContain(res.statusCode);
    if (res.body && res.body.title) {
      expect(res.body.title).toContain("<script>alert('film')</script>");
    }
  });
});


afterAll(async () => {
  await mongoose.connection.close();
});
