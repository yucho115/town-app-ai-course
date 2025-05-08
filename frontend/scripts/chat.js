async function sendMessage() {
    const input = document.getElementById("prompt");
    const message = input.value.trim();
    if (!message) return;

    const chatBox = document.getElementById("chat-box");

    // ユーザーのメッセージ表示
    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.textContent = message;
    chatBox.appendChild(userMsg);

    input.value = "";

    // AIの「考え中...」を表示
    const botMsg = document.createElement("div");
    botMsg.className = "message bot";
    botMsg.textContent = "考え中...";
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      });

      const data = await res.json();
      botMsg.textContent = data.response;
    } catch (err) {
      botMsg.textContent = "エラーが発生しました。";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  document.getElementById("prompt").addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });