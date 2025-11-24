import Quote from "../models/quote.js"


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
  // Pagination
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  let limit = parseInt(req.query.limit);
  if (isNaN(limit) || limit < 1) {
    limit = 0;
  }
  const skip = (page - 1) * (limit || 0);

  // Filtres optionnels
  const filters = {};
  if (req.query.emotion) filters.emotion = req.query.emotion;
  if (req.query.film) filters.film = req.query.film;
  if (req.query.text) filters.text = new RegExp(req.query.text, "i");

  // Requête + total pour la pagination
  const [quotes, total] = await Promise.all([
    Quote.find(filters)
      .skip(skip)
      .limit(limit)
      .populate("film"),
    Quote.countDocuments(filters),
  ]);

  res.json({
    page,
    limit,
    total,
    totalPages: limit ? Math.ceil(total / limit) : 1,
    items: quotes,
  });
};

export const getQuoteById = async (req, res) => {
    const quote = await Quote.findById(req.params.id);
    res.json(quote);
}