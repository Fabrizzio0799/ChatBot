export const sendMessage = async (message, onMessage, conversation_id = null) => {
  const body = { message };
  if (conversation_id) body.conversation_id = conversation_id;

  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new Error("Network response was not ok");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let lastInfo = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      if (part.startsWith("data: ")) {
        const json = JSON.parse(part.replace("data: ", ""));
        if (json.type === "content") onMessage(json.content);
        if (json.type === "done") lastInfo = { tokens: json.tokens, cost: json.cost };
      }
    }
  }
  if (lastInfo) onMessage("", lastInfo);
};
