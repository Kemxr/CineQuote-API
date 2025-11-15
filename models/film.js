import mongoose from "mongoose";

const filmSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    image: {
        type: String
    }, // Ajouter url image en bien
});

const Film = mongoose.model("Film", filmSchema);
export default Film;