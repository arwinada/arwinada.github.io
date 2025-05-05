const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  appendMessage("You", text);
  input.value = '';

  try {
    const response = await fetch('https://2004-2a09-bac5-1709-123-00-1d-d9.ngrok-free.app/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    appendMessage("Bot", data.reply || "(No reply)");
  } catch (err) {
    console.error("Error sending message:", err);
    appendMessage("Bot", "(Failed to get reply)");
  }
});
