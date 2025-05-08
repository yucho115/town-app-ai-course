let messages = [
  { role: "system", content: "あなたは親切なAIアシスタントです。" }
];

async function sendMessage() {
  const input = document.getElementById("prompt");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");

  // ユーザーのメッセージを表示＆履歴に追加
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);

  messages.push({ role: "user", content: message });
  input.value = "";

  // 考え中メッセージを追加
  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  botMsg.textContent = "考え中...";
  chatBox.appendChild(botMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }), // 履歴をすべて送信
    });

    const data = await res.json();
    botMsg.textContent = data.response;
    messages.push({ role: "assistant", content: data.response }); // AIの応答を履歴に追加
  } catch (err) {
    botMsg.textContent = "エラーが発生しました。";
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("prompt").addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});
