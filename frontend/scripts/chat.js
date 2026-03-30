document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("chat-messages");

  if (!form || !input || !messages) {
    console.error("必要な要素が見つかりません");
    return;
  }

  const chatHistory = [];

  function appendMessage(text, sender, addToHistory = true) {
    const row = document.createElement("div");
    row.classList.add("message-row", sender);

    const bubble = document.createElement("div");
    bubble.classList.add("message", sender);
    bubble.textContent = text;

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;

    if (addToHistory) {
      const role = sender === "user" ? "user" : "assistant";
      chatHistory.push({ role, content: text });
    }

    return bubble;
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, "user");

    // 入力欄を空にする
    form.reset();
    input.value = "";
    input.focus();

    const thinkingBubble = appendMessage("考え中...", "bot", false);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await response.json();
      const botReply = data.response ?? "応答を取得できませんでした";
      thinkingBubble.textContent = botReply;
      chatHistory.push({ role: "assistant", content: botReply });
    } catch (error) {
      const errorMessage = "エラー: " + error.message;
      thinkingBubble.textContent = errorMessage;
      chatHistory.push({ role: "assistant", content: errorMessage });
    }

    messages.scrollTop = messages.scrollHeight;
  });
});