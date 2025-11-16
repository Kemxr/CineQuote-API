import Film from "../models/film.js"

//L'ajout et la suppression de film se fera avec le seeder

export const getFilms = async (req, res) => {
    const films = await Film.find();
    res.json(films);
}

export const getFilmById = async (req, res) => {
    const film = await Film.findById(req.params.id);
    res.json(film);
}