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

async function ensureSSE() {
  if (es || !conversationId) return;          // already open or no ID yet

  const sseUrl = `${BACKEND_BASE}/events/${encodeURIComponent(conversationId)}`;
  console.log("Opening stream →", sseUrl);

  try {
    // Make a normal CORS fetch request that keeps the body open.
    const resp = await fetch(sseUrl, {
      headers: { Accept: "text/event-stream" },
      cache  : "no-cache",
      mode   : "cors"
    });
    if (!resp.ok) throw new Error(`Stream HTTP ${resp.status}`);

    // Keep the response locked in this reader.
    const reader   = resp.body.getReader();
    const decoder  = new TextDecoder("utf-8");
    let   buffer   = "";

    es = true;                     // mark “stream is open”
    console.log("SSE connected ✔︎");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;             // server closed the stream

      buffer += decoder.decode(value, { stream: true });

      // Split on double line-break = end of one SSE event
      let sep;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, sep).trim();
        buffer    = buffer.slice(sep + 2);

        // Ignore keep-alive comments that start with “:”
        if (!raw || raw.startsWith(":")) continue;

        // We only ever send one “data:” line per event.
        const json = raw.replace(/^data:\s*/, "");
        try {
          const { author, content } = JSON.parse(json);
          appendMessage(author?.display_name ?? "Bot", content.body);
        } catch (err) {
          console.error("Parse error", err, raw);
        }
      }
    }
  } catch (err) {
    console.error("Stream error:", err);
    appendMessage("System", "⚠️ Lost connection to server stream.");
    es = null;                     // allow a retry on next sendMessage
  }
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  if (!conversationId) {
    await fetch(`${BACKEND_BASE}/send`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ message: "", channel_id: CHANNEL_ID })
    }).then(r => r.json())
      .then(d => {
        conversationId = d.conversation_id?.trim();
        endUserId      = d.end_user_id?.trim();
      });
    ensureSSE();   // open the stream as soon as we have the ID
  }

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

    conversationId = data.conversation_id?.trim();
    endUserId      = data.end_user_id?.trim();

    ensureSSE();          // <<< open the stream now (only once)

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