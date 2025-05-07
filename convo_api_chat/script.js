const API_BASE = 'https://arwingen.ada.support/api/v2';
const TOKEN = 'd5a3d6166ec6f932cff66639d7ad4ce7';
const CHANNEL_ID = '680a4ebcbfc43b65c8d6a1f2';

let conversationId = null;
let endUserId = null;

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("You", message);
  input.value = "";

  if (!conversationId) {
    const convoRes = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel_id: CHANNEL_ID,
        metadata: {
          pass: "example_string_value",
          initial_url: "https://example.com",
          locale: "en-CA"
        }
      })
    });
    const convoData = await convoRes.json();
    conversationId = convoData.id;
    endUserId = convoData.participants.find(p => p.role === "end_user")?.id;
  }

  await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      author: {
        id: endUserId,
        role: "end_user",
        avatar: "https://www.gravatar.com",
        display_name: "Ada Lovelace"
      },
      content: {
        body: message,
        type: "text"
      }
    })
  });
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerText = `${sender}: ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
