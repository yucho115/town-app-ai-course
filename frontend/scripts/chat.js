document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("chat-messages");

  if (!form || !input || !messages) {
    console.error("必要な要素が見つかりません");
    return;
  }

  function appendMessage(text, sender) {
    const row = document.createElement("div");
    row.classList.add("message-row", sender);

    const bubble = document.createElement("div");
    bubble.classList.add("message", sender);
    bubble.textContent = text;

    row.appendChild(bubble);
    messages.appendChild(row);

    messages.scrollTop = messages.scrollHeight;
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
    const thinkingBubble = appendMessage("考え中...", "bot");

    input.value = "";

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      thinkingBubble.textContent = data.response ?? "応答を取得できませんでした";
    } catch (error) {
      thinkingBubble.textContent = "エラー: " + error.message;
    }

    messages.scrollTop = messages.scrollHeight;
  });
});