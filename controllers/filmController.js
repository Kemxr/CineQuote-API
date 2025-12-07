import Film from "../models/film.js"
import Quote from "../models/quote.js"
import mongoose from "mongoose";

export const createFilm = async (req, res) => {
  const { title, year, director, genre, image } = req.body;

  if (!title || !year || !director || !genre) {
    return res.status(400).json({ message: "Tous les champs requis doivent être remplis" });
  }

  const film = new Film({
    title,
    year,
    director,
    genre,
    image,
  });

  await film.save();
  res.status(201).json(film);
};

export const updateFilm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "ID film invalide" });
  }

  const film = await Film.findById(id);
  if (!film) return res.status(404).json({ message: "Film non trouvé" });

  const { title, year, director, genre, image } = req.body;

  if (title != null) film.title = title;
  if (year != null) film.year = year;
  if (director != null) film.director = director;
  if (genre != null) film.genre = genre;
  if (image != null) film.image = image;

  await film.save();
  res.json(film);
};

export const deleteFilm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "ID film invalide" });
  }

  const film = await Film.findById(id);
  if (!film) return res.status(404).json({ message: "Film non trouvé" });

  await film.deleteOne();
  res.json({ message: "Film supprimé avec succès" });
};

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