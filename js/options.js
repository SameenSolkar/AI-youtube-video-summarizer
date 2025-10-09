(async () => {
  try {
    const { GEMINI_API_KEY } = await chrome.storage.local.get("GEMINI_API_KEY");
    if (GEMINI_API_KEY) document.getElementById("key").value = GEMINI_API_KEY;
  } catch {
    // ignore
  }
})();

const message = document.getElementById("message");

document.getElementById("save").addEventListener("click",  () => {

  const v = document.getElementById("key").value.trim();
  chrome.storage.local.set({ GEMINI_API_KEY: v })
  .then(()=>{

    message.style.color = "green"
    message.innerText = "GEMINI key saved"
  })
  .catch(error=>{
    message.style.color = "green"
    message.innerText = error
  })
});
