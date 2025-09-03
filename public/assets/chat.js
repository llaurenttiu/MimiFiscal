const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("p-2", "rounded-lg", "my-1");
  messageDiv.classList.add(sender === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left");
  messageDiv.textContent = message;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  addMessage("user", prompt);
  userInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (data.text) {
      addMessage("bot", data.text);
    } else {
      addMessage("bot", "Eroare: nu am primit răspuns de la server.");
    }
  } catch (err) {
    console.error(err);
    addMessage("bot", "Eroare de conexiune la server.");
  }
});
