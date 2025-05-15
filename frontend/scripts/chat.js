document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("chat-messages");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (userMessage === "") return;

    const userMessageElem = document.createElement("div");
    userMessageElem.className = "message user";
    userMessageElem.textContent = userMessage;
    messages.appendChild(userMessageElem);

    input.value = "";


  });
});
