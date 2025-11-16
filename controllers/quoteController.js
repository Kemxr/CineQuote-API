import Quote from "../models/quote.js"

//Si je veux modifier / ajouter plus de truc dans quote le faire dans le model et
//ensuite modifier ici

export const addQuote = async (req, res) => {
    const quote = new Quote({
        text: req.body.text,
        emotion: req.body.emotion,
        film: req.body.film
    });
    await quote.save();
    res.status(201).json(quote);
}

export const updateQuote = async (req, res) => {
    const quote = await Quote.findById(req.params.id);
    if(req.body.text != null){
        quote.text = req.body.text;
    }

    if(req.body.emotion != null){
        quote.emotion = req.body.emotion;
    }

    if(req.body.film != null){
        quote.film = req.body.film;
    }

    await quote.save();
    res.json(quote);
}

export const deleteQuote = async (req, res) => {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: "Citation supprimée"});
}

export const getQuotes = async (req, res) => {
    const quotes = await Quote.find().populate("film");
    res.json(quotes);
}

export const getQuoteById = async (req, res) => {
    const quote = await Quote.findById(req.params.id);
    res.json(quote);
}