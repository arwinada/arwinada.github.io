let PROXY_URL = ''; // will be built at runtime
const CHANNEL_ID = '680a4ebcbfc43b65c8d6a1f2';

let BACKEND_BASE = "";
let conversationId = null;
let endUserId = null;
let es = null;

document.addEventListener("DOMContentLoaded", () => {
  const subdomain = prompt("Enter your ngrok subdomain (e.g. 'arwinbot'):");
  if (!subdomain) {
    alert("A subdomain is required to connect to the backend.");
    return;
  }
  BACKEND_BASE = `https://${subdomain}.ngrok-free.app`;

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
    const response = await fetch(`${BACKEND_BASE}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        channel_id: CHANNEL_ID,
        conversation_id: conversationId,
        end_user_id: endUserId,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    conversationId = data.conversation_id;
    endUserId = data.end_user_id;

    if (!es) {
      const sseUrl = `${BACKEND_BASE}/events/${encodeURIComponent(conversationId)}`;
      es = new EventSource(sseUrl);

      es.onopen = () => console.log("SSE connected →", sseUrl);

      es.onmessage = (e) => {
        const payload = JSON.parse(e.data);          // { author, content }
        const sender = payload.author?.display_name ?? "Bot";
        appendMessage(sender, payload.content.body);
      };

      es.onerror = (err) => {
        console.error("SSE error:", err);
        appendMessage("System", "⚠️ Lost connection to server stream.");
      };
    }
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