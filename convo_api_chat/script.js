const PROXY_URL = 'https://cb2f-2a09-bac5-1709-1ed2-00-312-15.ngrok-free.app/send'; // 🔁 Replace with your actual ngrok URL
const CHANNEL_ID = '680a4ebcbfc43b65c8d6a1f2';

let TOKEN = null;
let conversationId = null;
let endUserId = null;

// Prompt user for token on page load
function promptForToken() {
  TOKEN = prompt("Please enter your Ada API token:");
  if (!TOKEN) {
    alert("An API token is required to use the chat.");
  }
}

// Called when user clicks Send
async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message || !TOKEN) return;

  appendMessage("You", message);
  input.value = "";

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        token: TOKEN,
        channel_id: CHANNEL_ID,
        conversation_id: conversationId,
        end_user_id: endUserId
      })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error);

    // Update session state
    conversationId = data.conversation_id;
    endUserId = data.end_user_id;

    // Show bot's response
    appendMessage("Bot", data.reply);

  } catch (err) {
    console.error("Proxy error:", err);
    appendMessage("System", "❌ Message failed to send.");
  }
}

// Render a message into the chat box
function appendMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerText = `${sender}: ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
