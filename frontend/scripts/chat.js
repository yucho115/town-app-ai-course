document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("chat-messages");

  if (!form || !input || !messages) {
    console.error("必要な要素が見つかりません");
    return;
  }

  let chatHistory = [];

  function appendMessage(text, sender, addToHistory = true) {
    const row = document.createElement("div");
    row.classList.add("message-row", sender);

    const bubble = document.createElement("div");
    bubble.classList.add("message", sender);
    bubble.textContent = text;

    row.appendChild(bubble);
    messages.appendChild(row);

    messages.scrollTop = messages.scrollHeight;

    // 履歴に追加
    if (addToHistory) {
      const role = sender === "user" ? "user" : "assistant";
      chatHistory.push({ role: role, content: text });
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
    if (userMessage === "") return;

    appendMessage(userMessage, "user");
    const thinkingBubble = appendMessage("考え中...", "bot", false);

    input.value = "";

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await response.json();
      thinkingBubble.textContent = data.response ?? "応答を取得できませんでした";
      // 履歴にAIの応答を追加
      chatHistory.push({ role: "assistant", content: thinkingBubble.textContent });
    } catch (error) {
      thinkingBubble.textContent = "エラー: " + error.message;
      // エラーの場合も履歴に追加
      chatHistory.push({ role: "assistant", content: thinkingBubble.textContent });
    }

    messages.scrollTop = messages.scrollHeight;
  });
});