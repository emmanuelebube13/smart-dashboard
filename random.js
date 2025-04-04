let allQuotes = [];

async function fetchQuotes() {
  try {
    const response = await fetch("https://type.fit/api/quotes");
    allQuotes = await response.json();
    showRandomQuote(); // Show a quote once loaded
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
    document.getElementById("quote").innerText = "Couldn't load quotes.";
    document.getElementById("author").innerText = "";
  }
}

function showRandomQuote() {
  if (allQuotes.length === 0) {
    document.getElementById("quote").innerText = "Quotes are still loading...";
    return;
  }

  const randomIndex = Math.floor(Math.random() * allQuotes.length);
  const quote = allQuotes[randomIndex];

  document.getElementById("quote").innerText = quote.text;
  document.getElementById("author").innerText = quote.author ? `— ${quote.author}` : "— Unknown";
}

window.onload = fetchQuotes;
