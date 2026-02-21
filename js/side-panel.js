// --- Configuration you can tweak ---
const GEMINI_MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const summaryEl = document.getElementById("summary");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "getSummary") {
    const { url, style } = message.data;

    console.log(message);

    try {
      summaryEl.innerText = "";
      summaryEl.style.color = "black";
      summaryEl.classList.add("out-processing");

      const summary = await summarizeWithGemini(url, style);
      const formattedSummary = formatText(summary);

      summaryEl.classList.remove("out-processing");
      summaryEl.innerHTML = formattedSummary;
    } catch (error) {
      summaryEl.classList.remove("out-processing");
      summaryEl.style.color = "red";
      summaryEl.innerText = error?.message || String(error);
    }
  }
});

// Build a prompt template based on the selected style
function buildPrompt(style) {
  const validStyles = ["chapters", "tldr", "study", "bullets"];
  if (!validStyles.includes(style)) {
    style = "bullets"; // Default fallback for unknown styles
  }

  switch (style) {
    case "chapters":
      return "Summarize this video into clear chapters with titles. For each chapter, add a start timestamp (MM:SS) and 2-3 bullets.";
    case "tldr":
      return "Give a concise TL;DR (3-5 sentences) and 3 key takeaways with timestamps (MM:SS) if helpful.";
    case "study":
      return "Create study notes: 6-10 bullets with timestamps (MM:SS), a short summary paragraph, and 5 quiz questions with answers.";
    case "bullets":
    default:
      return "Summarize this video with 6–10 concise bullets. Include helpful timestamps (MM:SS) and a 1–2 sentence TL;DR at the end.";
  }
}

// Core call to Gemini: pass the YouTube link as a file part
async function summarizeWithGemini(url, style) {
  
    const { GEMINI_API_KEY } = await chrome.storage.local.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY)
      throw new Error(
        "Missing API key. Open the extension Options to save your Gemini API key."
      );

    const body = {
      contents: [
        {
          parts: [
            // Crucial: pass the video URL as a file part so Gemini fetches/understands it.
            { file_data: { file_uri: url } },
            { text: buildPrompt(style) },
          ],
        },
      ],
    };

    const endpoint = `${API_BASE}/models/${encodeURIComponent(
      GEMINI_MODEL
    )}:generateContent`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || res.statusText || "Gemini API error";
      throw new Error(msg);
    }

    // Validate candidates exist in response
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      throw new Error("Invalid API response: no candidates returned");
    }

    // Pull text parts into a single string, filtering out null/undefined parts
    const text = data.candidates[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) throw new Error("No summary content returned from API");
    return text;
}

// Escape HTML entities to prevent XSS attacks before inserting into innerHTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatText(input) {
  // Escape all HTML first to prevent XSS from API response
  const escaped = escapeHtml(input);

  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // markdown bold to HTML
    .replace(/^\*\s*(.+)/gm, "<li>$1</li>") // * bullets to <li>
    .replace(/(<li>[\s\S]*<\/li>)/g, "<ul>$1</ul>") // wrap all li in ul
    .replace(/^(?!<ul|<li)(.+)$/gm, "<p>$1</p>"); // paragraphs to <p>
}
