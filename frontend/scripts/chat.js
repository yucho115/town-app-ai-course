document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("chat-messages");

  // Enterキーで送信
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (userMessage === "") return;

    // ユーザーメッセージを表示
    const userMessageElem = document.createElement("div");
    userMessageElem.className = "message user";
    userMessageElem.textContent = userMessage;
    messages.appendChild(userMessageElem);

    // 考え中メッセージを表示
    const thinkingMessage = document.createElement("div");
    thinkingMessage.className = "message bot";
    thinkingMessage.textContent = "考え中...";
    messages.appendChild(thinkingMessage);

    input.value = "";

    // サーバーにメッセージを送信
    fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
      // 考え中をAI応答に置き換え
      thinkingMessage.textContent = data.response;
    })
    .catch(error => {
      // エラー時はエラーメッセージを表示
      thinkingMessage.textContent = "エラー: " + error.message;
    });

    // スクロールを下に
    messages.scrollTop = messages.scrollHeight;
  });
});
