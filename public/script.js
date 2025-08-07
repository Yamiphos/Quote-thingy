let lastQuoteId = null; // stores the last displayed quote ID to exclude it in the next random quote request
let quotesVisible = false; // Tracks whether quotes are shown or hidden

// Fetch and display a random quote with optional filters
async function getRandomQuote() {
  const author = document.getElementById("authorFilter").value;
  const topic = document.getElementById("topicFilter").value;

  let url = "/api/random";
  const params = new URLSearchParams();

  if (author) params.append("author", author);
  if (topic) params.append("topic", topic);
  if (lastQuoteId !== null) params.append("excludeId", lastQuoteId);

  if ([...params].length > 0) url += `?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("No quote found.");
    const quote = await res.json();

    document.getElementById("quote-text").textContent = `"${quote.text}"`;
    document.getElementById("quote-author").textContent = `– ${quote.author}`;
    document.getElementById("quote-topics").textContent = "Topics: " + quote.topics.join(", ");

    lastQuoteId = quote.id;  // store the current quote ID to exclude next time
  } catch (err) {
    document.getElementById("quote-text").textContent = err.message;
    document.getElementById("quote-author").textContent = "";
    lastQuoteId = null;  // reset if error
  }
}

async function toggleAllQuotes() {
  const container = document.getElementById("all-quotes");
  const button = document.getElementById("toggle-quotes-btn");
  const bottomHideButton = document.getElementById("bottomHideButton");

  if (quotesVisible) {
    // Hide quotes
    container.innerHTML = "";
    button.textContent = "Show All Quotes";
    quotesVisible = false;
    bottomHideButton.style.display = "none";
    return;
  }

  // Show quotes
  const author = document.getElementById("authorFilter").value;
  const topic = document.getElementById("topicFilter").value;
  bottomHideButton.style.display = "inline-block";

  let url = "/api/quotes";
  const params = new URLSearchParams();

  if (author) params.append("author", author);
  if (topic) params.append("topic", topic);
  if ([...params].length > 0) url += `?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("No quotes found.");
    const quotes = await res.json();

    container.innerHTML = "";

    if (quotes.length === 0) {
      container.textContent = "No quotes match your filters.";
    } else {
      quotes.forEach(q => {
        const div = document.createElement("div");
        div.style.border = "1px solid #ccc";
        div.style.padding = "0.5rem";
        div.style.marginBottom = "0.5rem";
        div.style.backgroundColor = "#f5f5f5";
        div.innerHTML = `
          <p>"${q.text}"</p>
          <p><strong>– ${q.author}</strong></p>
          <p style="font-style: italic; color: #555;">Topics: ${q.topics.join(", ")}</p>
        `;
        container.appendChild(div);
      });
    }

    button.textContent = "Hide All Quotes";
    quotesVisible = true;
  } catch (err) {
    container.textContent = err.message;
    button.textContent = "Show All Quotes";
    quotesVisible = false;
  }
}

// new quote submission
document.getElementById("add-quote-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = document.getElementById("newText").value;
  const author = document.getElementById("newAuthor").value;
  const topics = document.getElementById("newTopics").value.split(",").map(t => t.trim());

  try {
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, author, topics })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById("addStatus").textContent = "Quote added!";
      document.getElementById("add-quote-form").reset();
    } else {
      document.getElementById("addStatus").textContent = "Error: " + data.error;
    }
  } catch (err) {
    document.getElementById("addStatus").textContent = "Something went wrong.";
  }
});
