// --- Configuration you can tweak ---
const GEMINI_MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// UI wiring
const urlEl = document.getElementById("url");
let outEl = document.getElementById("out");
const styleEl = document.getElementById("style");

// Basic YouTube URL check
function isYouTubeUrl(u) {
  return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/i.test(u);
}

// Build a prompt template based on the selected style
function buildPrompt(style) {
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
  if (!GEMINI_API_KEY) throw new Error("Missing API key. Open the extension Options to save your Gemini API key.");

  const body = {
    contents: [{
      parts: [
        // Crucial: pass the video URL as a file part so Gemini fetches/understands it.
        { file_data: { file_uri: url } },
        { text: buildPrompt(style) }
      ]
    }]
  };

  const endpoint = `${API_BASE}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || "Gemini API error";
    throw new Error(msg);
  }

  // Pull text parts into a single string
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n").trim();
  return text || "(No text returned)";
}

function formatText(input) {
  return input
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')   // markdown bold to HTML
  .replace(/^\*\s*(.+)/gm, '<li>$1</li>')             // * bullets to <li>
  .replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>')     // wrap all li in ul
  .replace(/^(?!<ul|<li)(.+)$/gm, '<p>$1</p>');       // paragraphs to <p>

}

document.getElementById("summarize").addEventListener("click", async () => {

  outEl.innerText = "";
  outEl.style.color = "black"
  const url = urlEl.value.trim();
  outEl.classList.add("out-processing")
  try {
    if (!isYouTubeUrl(url)) {
      throw new Error("Please paste a valid YouTube URL.");
    }
    const style = styleEl.value;
    const rawSummary = await summarizeWithGemini(url, style);
    const summary = formatText(rawSummary);
    outEl.classList.remove("out-processing")
    outEl.innerHTML = summary;
  } catch (err) {
    outEl.classList.remove("out-processing")
    outEl.style.color = "red";
    outEl.innerText = (err?.message || String(err));
  }
});

// Autofill current tab’s URL if it’s a YouTube watch page
(async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && typeof tab.url === "string" && isYouTubeUrl(tab.url)) {
      urlEl.value = tab.url;
    }
  } catch {
    // ignore
  }
})();
