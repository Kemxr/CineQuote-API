import Film from "../models/film.js"
import Quote from "../models/quote.js"
import mongoose from "mongoose";

//L'ajout et la suppression de film se fera avec le seeder

export const getFilms = async (req, res) => {
    const films = await Film.find();
    res.json(films);
}

export const getFilmById = async (req, res) => {
    const film = await Film.findById(req.params.id);
    res.json(film);
}

export const getQuoteCount = async (req, res) => {
  const filmId = req.params.id;
  if (!mongoose.isValidObjectId(filmId)) return res.status(400).json({ message: "ID film invalide" });
  const count = await Quote.countDocuments({ film: filmId });
  res.json({ quoteCount: count });
};

//Aggregation pipeline
export const getTopFilms = async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const pipeline = [
    { $group: { _id: "$film", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "films",
        localField: "_id",
        foreignField: "_id",
        as: "film"
      }
    },
    { $unwind: "$film" }
  ];
  const results = await Quote.aggregate(pipeline);
  res.json(results);
};