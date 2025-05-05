const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Display user message
  appendMessage("You", text);
  input.value = '';

  // Send POST to backend
  const response = await fetch('https://2004-2a09-bac5-1709-123-00-1d-d9.ngrok-free.app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: text })
  });

  // Simulated webhook listener
  // Normally this would be async, via polling, SSE or WebSocket.
  setTimeout(() => {
    // Simulate webhook calling back with response
    const fakeResponse = `Echo: ${text}`;
    appendMessage("Bot", fakeResponse);
  }, 1500);
});

function appendMessage(sender, message) {
  const msg = document.createElement('div');
  msg.textContent = `${sender}: ${message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
