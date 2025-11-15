import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    emotion: {
        type: String,
        required: true
    },
    film: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Film",
        required: true
    },
});

const Quote = mongoose.model("Quote", quoteSchema);
export default Quote;