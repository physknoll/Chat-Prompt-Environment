// public/script.js

document.getElementById("start-session-btn").addEventListener("click", startSession);
document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keydown", (e) => {
  if (e.key === 'Enter') sendMessage();
});

let currentSessionId = null;

// Load sessions on page load
fetchSessions();

// Attach toggle event to all toggle-size buttons
document.querySelectorAll('.toggle-size-btn').forEach(btn => {
  btn.addEventListener('click', toggleTextareaSize);
});

async function fetchSessions() {
  const data = await fetch("/sessions").then(res => res.json());
  const sessionList = document.getElementById("session-list");
  sessionList.innerHTML = "";
  data.sessions.forEach(sess => {
    const container = document.createElement("div");
    container.className = "session-item";

    // Session load button
    const btn = document.createElement("button");
    btn.textContent = `${new Date(sess.timestamp).toLocaleString()} - ${sess.firstQuestion}`;
    btn.onclick = () => loadSession(sess.sessionId);
    container.appendChild(btn);

    // Delete icon
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "delete-icon";
    deleteIcon.innerHTML = "&#128465;"; // Trash bin icon
    deleteIcon.title = "Delete this session";
    deleteIcon.onclick = (e) => {
      e.stopPropagation(); // Prevent loading the session when clicking delete
      deleteSession(sess.sessionId);
    };
    container.appendChild(deleteIcon);

    sessionList.appendChild(container);
  });
}

async function loadSession(sessionId) {
  // Fetch session details
  const data = await fetch(`/session/${sessionId}`).then(res => res.json());
  if (data.error) {
    alert(data.error);
    return;
  }

  // Populate fields
  document.getElementById("business-description").value = data.session.businessDescription || "";
  document.getElementById("personality").value = data.session.personality || "";
  document.getElementById("category").value = data.session.category || "";
  document.getElementById("system-prompt").value = data.session.systemPrompt || "";
  document.getElementById("first-question").value = data.session.firstQuestion || "";

  currentSessionId = data.session.sessionId;

  // Clear chat and populate conversation
  const chatHistory = document.getElementById("chat-history");
  chatHistory.innerHTML = "";
  data.conversation.forEach(msg => {
    if (msg.userMessage) {
      addMessage("user", msg.userMessage);
    } else if (msg.assistantMessage) {
      addMessage("assistant", msg.assistantMessage);
    }
  });
}

async function startSession() {
  const businessDescription = document.getElementById("business-description").value.trim();
  const personality = document.getElementById("personality").value.trim();
  const category = document.getElementById("category").value.trim();
  const systemPrompt = document.getElementById("system-prompt").value.trim();
  const firstQuestion = document.getElementById("first-question").value.trim();

  // Clear chat history
  document.getElementById("chat-history").innerHTML = "";

  // Send configuration to server
  const response = await fetch("/start", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      businessDescription,
      personality,
      category,
      systemPrompt,
      firstQuestion
    })
  }).then(res => res.json());

  if (response.error) {
    alert(response.error);
    return;
  }

  currentSessionId = response.sessionId;

  // Display the assistant's first question (no LLM call needed, it's direct)
  addMessage("assistant", response.reply);

  // Re-fetch sessions to update the list
  fetchSessions();
}

async function sendMessage() {
  const userInput = document.getElementById("user-input");
  const message = userInput.value.trim();
  if (!message || !currentSessionId) return; // Need a session started

  addMessage("user", message);
  userInput.value = "";

  const typingMessageId = addMessage("assistant", "", true);

  const response = await fetch("/chat", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({message, sessionId: currentSessionId})
  }).then(res => res.json());

  removeMessageById(typingMessageId);
  animateTyping("assistant", response.reply);
}

function addMessage(role, text, isTyping = false) {
  const chatHistory = document.getElementById("chat-history");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  const messageId = `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  msgDiv.setAttribute('data-id', messageId);

  if (isTyping) {
    const typingSpan = document.createElement("span");
    typingSpan.className = "typing";
    msgDiv.appendChild(typingSpan);
  } else {
    msgDiv.textContent = text;
  }

  chatHistory.appendChild(msgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return messageId;
}

function removeMessageById(messageId) {
  const chatHistory = document.getElementById("chat-history");
  const msg = chatHistory.querySelector(`.message[data-id='${messageId}']`);
  if(msg) msg.remove();
}

function animateTyping(role, text) {
  const chatHistory = document.getElementById("chat-history");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  chatHistory.appendChild(msgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  const words = text.split(" ");
  let currentIndex = 0;
  const typingDelay = 100;

  const interval = setInterval(() => {
    if (currentIndex < words.length) {
      msgDiv.textContent += (currentIndex > 0 ? " " : "") + words[currentIndex];
      currentIndex++;
      chatHistory.scrollTop = chatHistory.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, typingDelay);
}

async function deleteSession(sessionId) {
  if (!confirm("Are you sure you want to delete this session?")) return;
  const response = await fetch(`/session/${sessionId}`, {
    method: "DELETE"
  }).then(res => res.json());

  if (response.error) {
    alert(response.error);
    return;
  }
  
  // Refresh sessions
  fetchSessions();

  // If the deleted session was currently loaded, clear the UI
  if (currentSessionId === sessionId) {
    currentSessionId = null;
    document.getElementById("business-description").value = "";
    document.getElementById("personality").value = "";
    document.getElementById("category").value = "";
    document.getElementById("system-prompt").value = "";
    document.getElementById("first-question").value = "";
    document.getElementById("chat-history").innerHTML = "";
  }
}

function toggleTextareaSize(e) {
  const targetId = e.target.getAttribute('data-target');
  const textarea = document.getElementById(targetId);
  if (!textarea) return;

  // If it's currently small (3 rows), expand to 10, else shrink back to 3
  if (textarea.rows === 3) {
    textarea.rows = 10;
  } else {
    textarea.rows = 3;
  }
}
