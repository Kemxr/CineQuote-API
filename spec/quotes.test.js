// tests/quotes.test.js

import request from 'supertest';
import app from '../app.js';

describe('GET /quotes', () => {
  it('devrait renvoyer un tableau de citations et un statut 200', async () => {
    const res = await request(app).get('/quotes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('chaque citation renvoyée a les bons champs', async () => {
    const res = await request(app).get('/quotes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const quote = res.body[0];
      expect(quote).toHaveProperty('text');
      expect(quote).toHaveProperty('emotion');
      expect(quote).toHaveProperty('film');
    }
  });

});

describe('GET /quotes pagination', () => {
  it('renvoie le bon nombre d’éléments selon limit', async () => {
    const res = await request(app).get('/quotes?limit=2');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(2);
  });
});

describe('GET /', () => {
  it('répond avec succès sur la racine', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});


it('devrait rester stable face à une injection JS ou HTML dans le champ text', async () => {
  const maliciousQuote = {
    text: "<script>alert('hack')</script>",
    emotion: "surprise",
    film: "000000000000000000000000"  // ID bidon pour l’exemple
  };
  const res = await request(app)
    .post('/quotes')
    .send(maliciousQuote)
    .set('Accept', 'application/json');
  expect([200, 201, 400, 401, 422]).toContain(res.statusCode);
  // Optionnel : analyse le body si la quote est créée
  if (res.body && res.body.text) {
    expect(res.body.text).toContain("<script>alert('hack')</script>");
  }
});


// Nettoyage global mongoose après tous les tests
import mongoose from 'mongoose';

afterAll(async () => {
  await mongoose.connection.close();
});
