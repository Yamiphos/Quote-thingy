import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Setup for __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Load quotes from JSON file
function loadQuotes() {
  const data = fs.readFileSync("quotes.json", "utf-8");
  return JSON.parse(data);
}

// Save quotes to JSON file
function saveQuotes(quotes) {
  fs.writeFileSync("quotes.json", JSON.stringify(quotes, null, 2));
}

// GET /api/quotes - all quotes with optional filters
app.get("/api/quotes", (req, res) => {
  const { author, topic } = req.query;
  let quotes = loadQuotes();

  if (author) {
    quotes = quotes.filter(q =>
      q.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (topic) {
    quotes = quotes.filter(q =>
      q.topics.map(t => t.toLowerCase()).includes(topic.toLowerCase())
    );
  }

  res.json(quotes);
});

// GET /api/random - one random quote with optional filters
app.get("/api/random", (req, res) => {
  const { author, topic, excludeId } = req.query;
  let quotes = loadQuotes();

  if (author) {
    quotes = quotes.filter(q =>
      q.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (topic) {
    quotes = quotes.filter(q =>
      q.topics.map(t => t.toLowerCase()).includes(topic.toLowerCase())
    );
  }

  if (excludeId) {
    quotes = quotes.filter(q => q.id !== Number(excludeId));
  }

  if (quotes.length === 0) return res.status(404).json({ error: "No quotes found." });

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json(randomQuote);
});

// POST /api/quotes - add a new quote
app.post("/api/quotes", (req, res) => {
  const { text, author, topics } = req.body;
  if (!text || !author || !topics) {
    return res.status(400).json({ error: "Missing text, author, or topics." });
  }

  const quotes = loadQuotes();
  const newId = quotes.length > 0 ? quotes[quotes.length - 1].id + 1 : 1;

  const newQuote = {
    id: newId,
    text,
    author,
    topics
  };

  quotes.push(newQuote);
  saveQuotes(quotes);

  res.status(201).json({ message: "Quote added!", quote: newQuote });
});

// Server Starting
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
