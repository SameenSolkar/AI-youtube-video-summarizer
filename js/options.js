(async () => {
  try {
    const { GEMINI_API_KEY } = await chrome.storage.local.get("GEMINI_API_KEY");
    if (GEMINI_API_KEY) document.getElementById("key").value = GEMINI_API_KEY;
  } catch {
    // ignore
  }
})();

const message = document.getElementById("message");

document.getElementById("save").addEventListener("click", () => {

  const v = document.getElementById("key").value.trim();

  // Basic API key validation before saving
  if (!v) {
    message.style.color = "red";
    message.innerText = "API key cannot be empty.";
    return;
  }

  if (v.length < 20) {
    message.style.color = "red";
    message.innerText = "API key appears to be invalid (too short).";
    return;
  }

  chrome.storage.local.set({ GEMINI_API_KEY: v })
  .then(() => {

    message.style.color = "green";
    message.innerText = "GEMINI key saved";

    setTimeout(() => {
      window.close();
    }, 1000);
  })
  .catch(error => {
    message.style.color = "red"; // Fixed: was incorrectly set to "green"
    message.innerText = error;
  });
});
