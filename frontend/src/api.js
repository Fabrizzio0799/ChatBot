export async function sendMessage(message, onMessage, conversationId) {
  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  });
  const data = await response.json();
  onMessage(data.content, { tokens: data.tokens, cost: data.cost });
}
