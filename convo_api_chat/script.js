const PROXY_URL = 'https://your-ngrok-url.ngrok-free.app/send';
const CHANNEL_ID = '680a4ebcbfc43b65c8d6a1f2';

let conversationId = null;
let endUserId = null;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
  });
});

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("You", message);
  input.value = "";

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        channel_id: CHANNEL_ID,
        conversation_id: conversationId,
        end_user_id: endUserId
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    conversationId = data.conversation_id;
    endUserId = data.end_user_id;

    appendMessage("Bot", data.reply);

  } catch (err) {
    console.error("Proxy error:", err);
    appendMessage("System", "❌ Message failed to send.");
  }
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerText = `${sender}: ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
